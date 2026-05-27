package com.cxisystem.feature.service;

import static com.cxisystem.jooq.tables.Location.LOCATION;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.LocationDao;
import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.LocationFilterInput;
import com.cxisystem.feature.input.LocationInput;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.type.Location;
import com.cxisystem.jooq.tables.records.LocationRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;

/**
 * 拠点管理の業務操作をまとめるサービスです。 一覧、詳細、登録、更新、削除を提供します。
 */
@ApplicationScoped
public class LocationService
    extends AbstractService<LocationRecord, Location, String, LocationDao> {

  @Inject
  LocationDao locationDao;

  /** 拠点操作に使う Dao を返します。 */
  @Override
  protected LocationDao getDao() {
    return locationDao;
  }

  /** 拠点変換先の型を返します。 */
  @Override
  protected Class<Location> getTypeClass() {
    return Location.class;
  }

  /** 条件付きの拠点一覧をページ情報付きで返します。 */
  @Rls
  @Transactional
  public Page<Location> pagination(Pagination pagination, LocationFilterInput filter) {
    List<Location> locations = locationDao.pagination(pagination, filter).stream()
        .map(record -> record.into(Location.class)).collect(Collectors.toList());
    long total = locationDao.fetchCount(filter);
    int totalPages =
        pagination.getLimit() > 0 ? (int) Math.ceil((double) total / pagination.getLimit()) : 0;

    if (pagination.getOffset() < 0 || pagination.getLimit() <= 0
        || pagination.getOffset() >= total) {
      return new Page<>(Collections.emptyList(), pagination.getOffset(), pagination.getLimit(),
          total, totalPages);
    }

    return new Page<>(locations, pagination.getOffset(), pagination.getLimit(), total, totalPages);
  }

  /** 拠点を新規作成して、保存後の値を返します。 */
  @Rls
  @Transactional
  public Location create(LocationInput input) {
    LocationRecord locationRecord = newRecord(input);
    normalizeOptionalFields(locationRecord);
    if (Boolean.TRUE.equals(locationRecord.getIsDefault())) {
      unsetOtherDefaults(null);
    }
    locationRecord.store();
    locationRecord.refresh();
    return locationRecord.into(Location.class);
  }

  /** 既存拠点を更新して、保存後の値を返します。 */
  @Rls
  @Transactional
  public Location update(String id, LocationInput input) {
    LocationRecord locationRecord = locationDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("location not found: " + id));
    boolean wasDefault = Boolean.TRUE.equals(locationRecord.getIsDefault());
    locationRecord.from(input);
    normalizeOptionalFields(locationRecord);
    if (wasDefault && !Boolean.TRUE.equals(input.getIsDefault())) {
      locationRecord.setIsDefault(true);
    }
    if (Boolean.TRUE.equals(locationRecord.getIsDefault())) {
      unsetOtherDefaults(id);
    }
    locationRecord.store();
    locationRecord.refresh();
    return locationRecord.into(Location.class);
  }

  /** デフォルト拠点を除き、拠点を論理削除します。 */
  @Rls
  @Transactional
  public boolean deleteLocation(String id) {
    LocationRecord locationRecord = locationDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("location not found: " + id));
    if (Boolean.TRUE.equals(locationRecord.getIsDefault())) {
      throw new IllegalStateException("default location cannot be deleted");
    }
    locationRecord.setDeletedAt(LocalDateTime.now());
    locationRecord.store();
    return true;
  }

  private void normalizeOptionalFields(LocationRecord locationRecord) {
    locationRecord.setAreaId(StringUtils.trimToNull(locationRecord.getAreaId()));
    locationRecord.setZipCode(StringUtils.trimToNull(locationRecord.getZipCode()));
    locationRecord.setPrefectureCode(StringUtils.trimToNull(locationRecord.getPrefectureCode()));
    locationRecord.setAddress(StringUtils.trimToNull(locationRecord.getAddress()));
    if (locationRecord.getIsDefault() == null) {
      locationRecord.setIsDefault(false);
    }
  }

  private void unsetOtherDefaults(String keepId) {
    var condition = LOCATION.DELETED_AT.isNull().and(LOCATION.IS_DEFAULT.isTrue());
    if (StringUtils.isNotBlank(keepId)) {
      condition = condition.and(LOCATION.ID.ne(keepId));
    }
    dsl().update(LOCATION).set(LOCATION.IS_DEFAULT, false).where(condition).execute();
  }
}
