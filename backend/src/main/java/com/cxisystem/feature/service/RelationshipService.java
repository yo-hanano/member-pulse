package com.cxisystem.feature.service;

import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.RelationshipDao;
import com.cxisystem.feature.type.Relationship;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;

/**
 * 続柄マスタの読み取りをまとめるサービスです。 保護者入力で使う取得処理を提供します。
 */
@ApplicationScoped
public class RelationshipService {

  @Inject
  RelationshipDao relationshipDao;

  /** 画面表示用に続柄一覧を返します。 */
  public List<Relationship> findAll() {
    return relationshipDao.findAll().stream().map(record -> record.into(Relationship.class))
        .toList();
  }

  /** 指定された続柄コードに一致する値を返します。 */
  public Relationship findByCode(String code) {
    var record = relationshipDao.findByCode(code);
    return record == null ? null : record.into(Relationship.class);
  }

  /** 続柄コードに対応する値を返し、見つからなければ例外にします。 */
  public Relationship findByCodeOrThrow(String code) {
    Relationship relationship = findByCode(code);
    if (relationship == null) {
      throw new NotFoundException("relationship not found: " + code);
    }
    return relationship;
  }
}
