package com.cxisystem.feature.service;

import com.cxisystem.annotation.Rls;
import com.cxisystem.feature.dao.SubjectDao;
import com.cxisystem.feature.type.Subject;
import com.cxisystem.jooq.tables.records.SubjectRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 科目マスタの参照操作をまとめるサービスです。 コース登録などの選択肢取得に使います。
 */
@ApplicationScoped
public class SubjectService extends AbstractService<SubjectRecord, Subject, String, SubjectDao> {

  @Inject
  SubjectDao subjectDao;

  /** 科目操作に使う Dao を返します。 */
  @Override
  protected SubjectDao getDao() {
    return subjectDao;
  }

  /** 科目変換先の型を返します。 */
  @Override
  protected Class<Subject> getTypeClass() {
    return Subject.class;
  }

  /** 有効な科目候補を返します。 */
  @Rls
  @Transactional
  public List<Subject> findOptions() {
    return subjectDao.findActiveOptions().stream().map(record -> record.into(Subject.class))
        .collect(Collectors.toList());
  }
}
