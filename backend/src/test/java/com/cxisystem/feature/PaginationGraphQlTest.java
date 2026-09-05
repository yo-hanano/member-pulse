package com.cxisystem.feature;

import com.cxisystem.test.GraphQlTestProfile;
import com.cxisystem.test.GraphQlTestSupport;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import io.restassured.path.json.JsonPath;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * 一覧のページングとソートの契約テストです。
 *
 * <p>
 * 一覧はどの画面にもあり、`offset` / `limit` / `orderBy` / `totalCount` の噛み合わせが崩れると、
 * 行が重複したり最後のページが欠けたりします。1 ページ目だけを見ている限り気づきにくいので、 ページ送りで全件をなぞる形で検証します。
 *
 * <p>
 * 件数を数える都合上、テスト専用の会社を作り、そこにだけデータを置きます。
 */
@QuarkusTest
@TestProfile(GraphQlTestProfile.class)
class PaginationGraphQlTest extends GraphQlTestSupport {

  // limit は @Min(10) @Max(100) なので、ページ送りを見るには 10 を超える件数が要る
  private static final int TOTAL_AREAS = 25;

  private static final int PAGE_SIZE = 10;

  private static final String CREATE_AREA = """
      mutation createArea($input: AreaInput!) {
        createArea(input: $input) { id }
      }
      """;

  private static final String AREA_PAGE = """
      query areaPage($pagination: Pagination!) {
        areaPagination(pagination: $pagination) {
          contents { id name dispOrder: displayOrder }
          totalCount
          totalPages
          limit
          offset
        }
      }
      """;

  /** ページを送ると全件を重複なくたどれることを確かめます。 */
  @Test
  void pagingThroughAllPagesYieldsEveryRowExactlyOnce() {
    withAreas(token -> {
      int limit = PAGE_SIZE;
      List<String> collected = new ArrayList<>();
      int totalCount = -1;
      int totalPages = -1;

      for (int offset = 0; offset < TOTAL_AREAS; offset += limit) {
        JsonPath page = fetchPage(token, offset, limit, "display_order", "asc");
        totalCount = page.getInt("data.areaPagination.totalCount");
        totalPages = page.getInt("data.areaPagination.totalPages");
        collected.addAll(page.getList("data.areaPagination.contents.id"));

        Assertions.assertEquals(offset, page.getInt("data.areaPagination.offset"),
            "offset must be echoed back as requested");
        Assertions.assertEquals(limit, page.getInt("data.areaPagination.limit"),
            "limit must be echoed back as requested");
      }

      Assertions.assertEquals(TOTAL_AREAS, totalCount, "totalCount must match the row count");
      Assertions.assertEquals(3, totalPages, "25 rows with limit 10 must span 3 pages");
      Assertions.assertEquals(TOTAL_AREAS, collected.size(),
          "paging must not skip or duplicate rows");
      Assertions.assertEquals(TOTAL_AREAS, Set.copyOf(collected).size(),
          "the same row must not appear on two pages");
    });
  }

  /** 最後のページが端数になることを確かめます。 */
  @Test
  void lastPageContainsRemainder() {
    withAreas(token -> {
      JsonPath lastPage = fetchPage(token, 20, PAGE_SIZE, "display_order", "asc");
      Assertions.assertEquals(5, lastPage.getList("data.areaPagination.contents").size(),
          "25 rows with limit 10 must leave 5 rows on the last page");
      Assertions.assertEquals(TOTAL_AREAS, lastPage.getInt("data.areaPagination.totalCount"),
          "totalCount must not change on the last page");
    });
  }

  /** 範囲を超えた offset が空ページを返し、件数は変わらないことを確かめます。 */
  @Test
  void offsetBeyondTotalReturnsEmptyPage() {
    withAreas(token -> {
      JsonPath page = fetchPage(token, 1000, PAGE_SIZE, "display_order", "asc");
      Assertions.assertTrue(page.getList("data.areaPagination.contents").isEmpty(),
          "an offset beyond the total must return no rows");
      Assertions.assertEquals(TOTAL_AREAS, page.getInt("data.areaPagination.totalCount"),
          "totalCount must still report the real total");
    });
  }

  /** 並び順の指定が実際に効き、昇順と降順が逆順になることを確かめます。 */
  @Test
  void orderDirectionReversesTheResult() {
    withAreas(token -> {
      List<Integer> ascending = fetchPage(token, 0, 100, "display_order", "asc")
          .getList("data.areaPagination.contents.dispOrder");
      List<Integer> descending = fetchPage(token, 0, 100, "display_order", "desc")
          .getList("data.areaPagination.contents.dispOrder");

      Assertions.assertEquals(TOTAL_AREAS, ascending.size());
      Assertions.assertEquals(ascending.stream().sorted().toList(), ascending,
          "asc must return rows in ascending order");
      Assertions.assertEquals(ascending.stream().sorted(Comparator.reverseOrder()).toList(),
          descending, "desc must return rows in descending order");
    });
  }

  /** 別の列でも並び替えられることを確かめます。 */
  @Test
  void orderByAppliesToTheRequestedColumn() {
    withAreas(token -> {
      List<String> names =
          fetchPage(token, 0, 100, "name", "asc").getList("data.areaPagination.contents.name");
      Assertions.assertEquals(names.stream().sorted().toList(), names,
          "rows must be ordered by the requested column");
    });
  }

  /**
   * 範囲外の limit が拒まれることを確かめます。
   *
   * <p>
   * limit は URL クエリから来るため、画面の選択肢（10/20/50/100）を外れた値が届きうります。 エラーの文面までは固定しません。現状は
   * Bean Validation の違反を smallrye-graphql が 解決できず内部 assertion
   * の文言が出るためで、そこは別途直す必要があります。
   */
  @Test
  void limitOutOfRangeIsRejected() {
    withAreas(token -> {
      Assertions.assertFalse(
          executeExpectingErrors(token, AREA_PAGE,
              Map.of("pagination", Map.of("offset", 0, "limit", 3))).isEmpty(),
          "a limit below the allowed minimum must be rejected");
      Assertions.assertFalse(
          executeExpectingErrors(token, AREA_PAGE,
              Map.of("pagination", Map.of("offset", 0, "limit", 1000))).isEmpty(),
          "a limit above the allowed maximum must be rejected");
    });
  }

  /** 1 ページ分を取得します。 */
  private JsonPath fetchPage(String token, int offset, int limit, String orderBy,
      String orderDirection) {
    return execute(token, AREA_PAGE, Map.of("pagination", Map.of("offset", offset, "limit", limit,
        "orderBy", orderBy, "orderDirection", orderDirection)));
  }

  /** テスト専用の会社にエリアを用意し、検証後に片付けます。 */
  private void withAreas(PagingAssertion assertion) {
    String companyId = createCompany("pg-" + shortId());
    try {
      String token = issueToken(companyId, "pg-user", Set.of("admin"));
      // 名前順と表示順が一致しないよう、名前は表示順の逆に振る
      for (int i = 1; i <= TOTAL_AREAS; i++) {
        execute(token, CREATE_AREA, Map.of("input",
            Map.of("name", String.format("エリア%02d", TOTAL_AREAS - i + 1), "dispOrder", i)));
      }
      assertion.check(token);
    } finally {
      purgeCompanyData(companyId);
      deleteCompany(companyId);
    }
  }

  /** 会社コードは一意制約があるため、テストごとに短いランダム値を使います。 */
  private String shortId() {
    return UUID.randomUUID().toString().substring(0, 8);
  }

  /** 検証本体を受け取る関数型インタフェース。 */
  @FunctionalInterface
  private interface PagingAssertion {
    void check(String token);
  }
}
