package com.cxisystem.feature.service;

import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.SchoolGradeDao;
import com.cxisystem.feature.type.SchoolGrade;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import java.util.Set;

/**
 * 学年マスタの読み取りをまとめるサービスです。 生徒や講師の入力補助で使う取得処理を提供します。
 */
@ApplicationScoped
public class SchoolGradeService {

  @Inject
  SchoolGradeDao schoolGradeDao;

  /** 画面表示用に学年一覧を返します。 */
  public List<SchoolGrade> findAll() {
    return schoolGradeDao.findAll().stream().map(record -> record.into(SchoolGrade.class)).toList();
  }

  /** 指定された学年コードに一致する値を返します。 */
  public SchoolGrade findByCode(String code) {
    var record = schoolGradeDao.findByCode(code);
    return record == null ? null : record.into(SchoolGrade.class);
  }

  /** 学年コードに対応する値を返し、見つからなければ例外にします。 */
  public SchoolGrade findByCodeOrThrow(String code) {
    SchoolGrade schoolGrade = findByCode(code);
    if (schoolGrade == null) {
      throw new NotFoundException("school grade not found: " + code);
    }
    return schoolGrade;
  }

  /** 指定された学年コード群に一致する値をまとめて返します。 */
  public List<SchoolGrade> findByCodes(Set<String> codes) {
    return schoolGradeDao.findByCodes(codes).stream().map(record -> record.into(SchoolGrade.class))
        .toList();
  }
}
