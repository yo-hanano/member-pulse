package com.cxisystem.feature.dao;

import static com.cxisystem.jooq.tables.BranchOpeningScheduleTemplate.BRANCH_OPENING_SCHEDULE_TEMPLATE;

import com.cxisystem.jooq.tables.records.BranchOpeningScheduleTemplateRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.NoArgsConstructor;
import org.jooq.DSLContext;

/** 開校スケジュールテンプレートの参照 SQL をまとめる Dao です。 */
@ApplicationScoped
@NoArgsConstructor
public class BranchOpeningScheduleTemplateDao
    extends AbstractDao<BranchOpeningScheduleTemplateRecord, String> {

  /** テンプレートを扱う Dao を初期化します。 */
  @Inject
  public BranchOpeningScheduleTemplateDao(DSLContext dsl) {
    super(dsl, BRANCH_OPENING_SCHEDULE_TEMPLATE, BRANCH_OPENING_SCHEDULE_TEMPLATE.ID);
  }
}
