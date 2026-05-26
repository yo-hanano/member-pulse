package com.cxisystem.feature.input;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.eclipse.microprofile.graphql.Input;
import org.eclipse.microprofile.graphql.Name;

/**
 * 一覧系Queryで共通利用するページネーション入力。 orderBy は DB カラム名をそのまま受ける前提で、Dao 側で存在確認する。
 */
@Name("Pagination")
@Input
@Data
@NoArgsConstructor
public class Pagination {

  @Min(10) @Max(100) private Integer limit = 10;

  @Min(0) private Integer offset = 0;

  private String orderBy;

  @Pattern(regexp = "(?i)ASC|DESC")
  private String orderDirection;

  /** ページネーション条件をまとめて生成します。 */
  public Pagination(Integer limit, Integer offset, String orderBy, String orderDirection) {
    this.limit = limit;
    this.offset = offset;
    this.orderBy = orderBy;
    this.orderDirection = orderDirection;
  }
}
