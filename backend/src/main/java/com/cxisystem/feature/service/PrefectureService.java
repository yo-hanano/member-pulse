package com.cxisystem.feature.service;

import com.cxisystem.feature.dao.PrefectureDao;
import com.cxisystem.feature.type.Prefecture;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import java.util.Set;

/**
 * 都道府県マスタの読み取りをまとめるサービスです。 選択肢表示や拠点 dataloader から使う取得処理を提供します。
 */
@ApplicationScoped
public class PrefectureService {

  @Inject
  PrefectureDao prefectureDao;

  /** 画面表示用に都道府県一覧を返します。 */
  public List<Prefecture> findAll() {
    return prefectureDao.findAll().stream().map(record -> record.into(Prefecture.class)).toList();
  }

  /** 指定された都道府県コード群に一致する値だけを返します。 */
  public List<Prefecture> findByCodes(Set<String> codes) {
    return prefectureDao.findByCodes(codes).stream().map(record -> record.into(Prefecture.class))
        .toList();
  }
}
