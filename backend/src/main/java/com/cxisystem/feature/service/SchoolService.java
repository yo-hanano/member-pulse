package com.cxisystem.feature.service;

import com.cxisystem.feature.dao.SchoolDao;
import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.input.SchoolFilterInput;
import com.cxisystem.feature.type.School;
import com.cxisystem.jooq.tables.records.SchoolRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 学校マスタの読み取りをまとめるサービスです。 CSV 同期前提の学校一覧検索と詳細参照を提供します。
 */
@ApplicationScoped
public class SchoolService extends AbstractService<SchoolRecord, School, String, SchoolDao> {

  @Inject
  SchoolDao schoolDao;

  /** 学校操作に使う Dao を返します。 */
  @Override
  protected SchoolDao getDao() {
    return schoolDao;
  }

  /** 学校変換先の型を返します。 */
  @Override
  protected Class<School> getTypeClass() {
    return School.class;
  }

  /** 条件付きの学校一覧をページ形式で返します。 */
  public Page<School> pagination(Pagination pagination, SchoolFilterInput filter) {
    List<School> schools = schoolDao.pagination(pagination, filter).stream()
        .map(record -> record.into(School.class)).collect(Collectors.toList());
    long total = schoolDao.fetchCount(filter);
    int totalPages =
        pagination.getLimit() > 0 ? (int) Math.ceil((double) total / pagination.getLimit()) : 0;

    if (pagination.getOffset() < 0 || pagination.getLimit() <= 0
        || pagination.getOffset() >= total) {
      return new Page<>(Collections.emptyList(), pagination.getOffset(), pagination.getLimit(),
          total, totalPages);
    }

    return new Page<>(schools, pagination.getOffset(), pagination.getLimit(), total, totalPages);
  }

  /** 学校コード群に一致する学校を返します。 */
  public List<School> findByCodes(Set<String> codes) {
    return schoolDao.findByCodes(codes).stream().map(record -> record.into(School.class))
        .collect(Collectors.toList());
  }
}
