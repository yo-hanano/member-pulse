package com.cxisystem.feature.service;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.BadRequestException;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.LeadDao;
import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.LeadFilterInput;
import com.cxisystem.feature.input.LeadInput;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.type.Lead;
import com.cxisystem.jooq.tables.records.LeadRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;

/**
 * リード管理の業務操作をまとめるサービスです。 current schema の CRUD と検索、論理削除を扱います。
 */
@ApplicationScoped
public class LeadService extends AbstractService<LeadRecord, Lead, String, LeadDao> {

  @Inject
  LeadDao leadDao;

  /** リード操作に使う Dao を返します。 */
  @Override
  protected LeadDao getDao() {
    return leadDao;
  }

  /** リード変換先の型を返します。 */
  @Override
  protected Class<Lead> getTypeClass() {
    return Lead.class;
  }

  /** 条件付きのリード一覧をページ形式で返します。 */
  @Rls
  @Transactional
  public Page<Lead> pagination(Pagination pagination, LeadFilterInput filter) {
    List<Lead> leads = leadDao.pagination(pagination, filter).stream()
        .map(record -> record.into(Lead.class)).collect(Collectors.toList());
    long total = leadDao.fetchCount(filter);
    int totalPages =
        pagination.getLimit() > 0 ? (int) Math.ceil((double) total / pagination.getLimit()) : 0;

    if (pagination.getOffset() < 0 || pagination.getLimit() <= 0
        || pagination.getOffset() >= total) {
      return new Page<>(Collections.emptyList(), pagination.getOffset(), pagination.getLimit(),
          total, totalPages);
    }

    return new Page<>(leads, pagination.getOffset(), pagination.getLimit(), total, totalPages);
  }

  /** リードを新規作成して、保存後の値を返します。 */
  @Rls
  @Transactional
  public Lead create(LeadInput input) {
    validateLeadInput(input);
    LeadRecord leadRecord = newRecord(input);
    leadRecord.store();
    leadRecord.refresh();
    return leadRecord.into(Lead.class);
  }

  /** 既存リードを更新して、保存後の値を返します。 */
  @Rls
  @Transactional
  public Lead update(String id, LeadInput input) {
    validateLeadInput(input);
    LeadRecord leadRecord = leadDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("lead not found: " + id));
    leadRecord.from(input);
    leadRecord.store();
    leadRecord.refresh();
    return leadRecord.into(Lead.class);
  }

  /** リードを論理削除します。 */
  @Rls
  @Transactional
  public boolean deleteLead(String id) {
    delete(id);
    return true;
  }

  /** DB の連絡先必須制約に合わせて、電話番号かメールアドレスの入力を確認します。 */
  private void validateLeadInput(LeadInput input) {
    if (StringUtils.isAllBlank(input.getPhone(), input.getEmail())) {
      throw new BadRequestException("lead phone or email is required");
    }
  }
}
