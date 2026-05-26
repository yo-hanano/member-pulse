package com.cxisystem.feature.service;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.BranchDao;
import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.BranchFilterInput;
import com.cxisystem.feature.input.BranchInput;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.type.Branch;
import com.cxisystem.jooq.tables.records.BranchRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 拠点管理の業務操作をまとめるサービスです。 一覧、詳細、登録、更新、削除を提供します。
 */
@ApplicationScoped
public class BranchService extends AbstractService<BranchRecord, Branch, String, BranchDao> {

  @Inject
  BranchDao branchDao;

  /** 拠点操作に使う Dao を返します。 */
  @Override
  protected BranchDao getDao() {
    return branchDao;
  }

  /** 拠点変換先の型を返します。 */
  @Override
  protected Class<Branch> getTypeClass() {
    return Branch.class;
  }

  /** 条件付きの拠点一覧をページ情報付きで返します。 */
  @Rls
  @Transactional
  public Page<Branch> pagination(Pagination pagination, BranchFilterInput filter) {
    List<Branch> branches = branchDao.pagination(pagination, filter).stream()
        .map(record -> record.into(Branch.class)).collect(Collectors.toList());
    long total = branchDao.fetchCount(filter);
    int totalPages =
        pagination.getLimit() > 0 ? (int) Math.ceil((double) total / pagination.getLimit()) : 0;

    if (pagination.getOffset() < 0 || pagination.getLimit() <= 0
        || pagination.getOffset() >= total) {
      return new Page<>(Collections.emptyList(), pagination.getOffset(), pagination.getLimit(),
          total, totalPages);
    }

    return new Page<>(branches, pagination.getOffset(), pagination.getLimit(), total, totalPages);
  }

  /** 拠点を新規作成して、保存後の値を返します。 */
  @Rls
  @Transactional
  public Branch create(BranchInput input) {
    BranchRecord branchRecord = newRecord(input);
    branchRecord.setIsDeleted(false);
    branchRecord.store();
    branchRecord.refresh();
    return branchRecord.into(Branch.class);
  }

  /** 既存拠点を更新して、保存後の値を返します。 */
  @Rls
  @Transactional
  public Branch update(String id, BranchInput input) {
    BranchRecord branchRecord = branchDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("branch not found: " + id));
    branchRecord.from(input);
    branchRecord.store();
    branchRecord.refresh();
    return branchRecord.into(Branch.class);
  }

  /** 拠点を論理削除します。 */
  @Rls
  @Transactional
  public boolean deleteBranch(String id) {
    delete(id);
    return true;
  }
}
