package com.cxisystem.feature.dto;

import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 一覧系 Query の結果を返す汎用ページ DTO。 frontend 側の一覧画面で総件数とページ情報をまとめて扱えるようにする。
 */
@NoArgsConstructor
@Getter
public class Page<T> {

  private List<T> contents;
  private int offset;
  private int limit;
  private long totalCount;
  private int totalPages;

  /** 一覧画面向けのページ情報をまとめて生成します。 */
  public Page(List<T> contents, int offset, int limit, long totalCount, int totalPages) {
    this.contents = contents;
    this.offset = offset;
    this.limit = limit;
    this.totalCount = totalCount;
    this.totalPages = totalPages;
  }
}
