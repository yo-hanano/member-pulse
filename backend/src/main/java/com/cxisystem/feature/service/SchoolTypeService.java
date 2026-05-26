package com.cxisystem.feature.service;

import com.cxisystem.feature.dao.SchoolTypeDao;
import com.cxisystem.feature.type.SchoolType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;

/**
 * 学校種マスタの読み取りをまとめるサービスです。 学校選択や CSV 参照で使う取得処理を提供します。
 */
@ApplicationScoped
public class SchoolTypeService {

  @Inject
  SchoolTypeDao schoolTypeDao;

  /** 画面表示用に学校種一覧を返します。 */
  public List<SchoolType> findAll() {
    return schoolTypeDao.findAll().stream().map(record -> record.into(SchoolType.class)).toList();
  }
}
