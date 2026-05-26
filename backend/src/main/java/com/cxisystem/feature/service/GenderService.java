package com.cxisystem.feature.service;

import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.GenderDao;
import com.cxisystem.feature.type.Gender;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;

/**
 * 性別マスタの読み取りをまとめるサービスです。 生徒や講師の入力補助で使う取得処理を提供します。
 */
@ApplicationScoped
public class GenderService {

  @Inject
  GenderDao genderDao;

  /**
   * 画面表示用に性別一覧を返します。
   */
  public List<Gender> findAll() {
    return genderDao.findAll().stream().map(record -> record.into(Gender.class)).toList();
  }

  /**
   * 指定された性別コードに一致する値を返します。
   */
  public Gender findByCode(String code) {
    var record = genderDao.findByCode(code);
    return record == null ? null : record.into(Gender.class);
  }

  /**
   * 性別コードに対応する値を返し、見つからなければ例外にします。
   */
  public Gender findByCodeOrThrow(String code) {
    Gender gender = findByCode(code);
    if (gender == null) {
      throw new NotFoundException("gender not found: " + code);
    }
    return gender;
  }
}
