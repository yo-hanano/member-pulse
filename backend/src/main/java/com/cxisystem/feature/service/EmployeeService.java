package com.cxisystem.feature.service;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.BadRequestException;
import com.cxisystem.exception.InvalidPasswordException;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.EmployeeDao;
import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.enumeration.EmployeeStatus;
import com.cxisystem.feature.input.EmployeeFilterInput;
import com.cxisystem.feature.input.EmployeeInput;
import com.cxisystem.feature.input.OwnAccountUpdateInput;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.type.Employee;
import com.cxisystem.feature.util.AuthContextUtil;
import com.cxisystem.feature.util.PasswordUtil;
import com.cxisystem.jooq.tables.records.EmployeeRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * employee の管理用 CRUD を担うサービス。 invite やパスワード更新は後続に回し、まずは一覧・詳細・登録・更新・削除を通す。
 */
@ApplicationScoped
public class EmployeeService
    extends AbstractService<EmployeeRecord, Employee, String, EmployeeDao> {

  @Inject
  EmployeeDao employeeDao;

  /** employee 操作に使う Dao を返します。 */
  @Override
  protected EmployeeDao getDao() {
    return employeeDao;
  }

  /** employee 変換先の型を返します。 */
  @Override
  protected Class<Employee> getTypeClass() {
    return Employee.class;
  }

  /** 条件付きの employee 一覧をページ情報付きで返します。 */
  @Rls
  @Transactional
  public Page<Employee> pagination(Pagination pagination, EmployeeFilterInput filter) {
    List<Employee> employees = employeeDao.pagination(pagination, filter).stream()
        .map(record -> record.into(Employee.class)).collect(Collectors.toList());
    long total = employeeDao.fetchCount(filter);
    int totalPages =
        pagination.getLimit() > 0 ? (int) Math.ceil((double) total / pagination.getLimit()) : 0;

    if (pagination.getOffset() < 0 || pagination.getLimit() <= 0
        || pagination.getOffset() >= total) {
      return new Page<>(Collections.emptyList(), pagination.getOffset(), pagination.getLimit(),
          total, totalPages);
    }

    return new Page<>(employees, pagination.getOffset(), pagination.getLimit(), total, totalPages);
  }

  /** employee を新規作成して、保存後の値を返します。 */
  @Rls
  @Transactional
  public Employee create(EmployeeInput input) {
    EmployeeRecord employeeRecord = newRecord(input);
    employeeRecord.setIsDeleted(false);
    employeeRecord.setStatus(EmployeeStatus.INVITED.value());
    employeeRecord.store();
    employeeRecord.refresh();
    return employeeRecord.into(Employee.class);
  }

  /** 既存 employee を更新して、保存後の値を返します。 */
  @Rls
  @Transactional
  public Employee update(String id, EmployeeInput input) {
    EmployeeRecord employeeRecord = employeeDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("employee not found: " + id));
    employeeRecord.from(input);
    employeeRecord.store();
    employeeRecord.refresh();
    return employeeRecord.into(Employee.class);
  }

  /** employee を論理削除します。 */
  @Rls
  @Transactional
  public boolean deleteEmployee(String id) {
    delete(id);
    return true;
  }

  /**
   * ログイン中ユーザー自身のアカウント情報を更新します。 currentPassword の検証を通過した場合のみ更新します。
   */
  @Rls
  @Transactional
  public Employee updateOwnAccount(OwnAccountUpdateInput input) {
    String currentUserId = AuthContextUtil.getCurrentUserId();
    if (currentUserId == null || currentUserId.isBlank()) {
      throw new NotFoundException("employee not found");
    }

    EmployeeRecord employeeRecord = employeeDao.findOptionalById(currentUserId)
        .orElseThrow(() -> new NotFoundException("employee not found: " + currentUserId));
    if (!EmployeeStatus.ACTIVE.value().equals(employeeRecord.getStatus())) {
      throw new NotFoundException("employee not found: " + currentUserId);
    }

    if (!PasswordUtil.verify(input.getCurrentPassword(), employeeRecord.getPassword())) {
      throw new InvalidPasswordException("current password is invalid");
    }

    String normalizedName = input.getName() == null ? "" : input.getName().trim();
    if (normalizedName.isBlank()) {
      throw new BadRequestException("name is required");
    }

    String normalizedNewPassword =
        input.getNewPassword() == null ? "" : input.getNewPassword().trim();
    if (!normalizedNewPassword.isBlank() && normalizedNewPassword.length() < 8) {
      throw new BadRequestException("new password must be at least 8 characters");
    }

    employeeRecord.setName(normalizedName);
    if (!normalizedNewPassword.isBlank()) {
      employeeRecord.setPassword(PasswordUtil.hash(normalizedNewPassword));
      employeeRecord.setPasswordSetAt(LocalDateTime.now());
    }

    employeeRecord.store();
    employeeRecord.refresh();
    return employeeRecord.into(Employee.class);
  }
}
