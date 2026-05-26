package com.cxisystem.feature.service;

import com.cxisystem.annotation.Rls;
import com.cxisystem.exception.NotFoundException;
import com.cxisystem.feature.dao.AreaDao;
import com.cxisystem.feature.dto.Page;
import com.cxisystem.feature.input.AreaFilterInput;
import com.cxisystem.feature.input.AreaInput;
import com.cxisystem.feature.input.AreaOrderInput;
import com.cxisystem.feature.input.Pagination;
import com.cxisystem.feature.type.Area;
import com.cxisystem.jooq.tables.records.AreaRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Query;

/**
 * エリア管理の業務操作をまとめるサービスです。 一覧、詳細、登録、更新、削除と表示順更新を提供します。
 */
@ApplicationScoped
public class AreaService extends AbstractService<AreaRecord, Area, String, AreaDao> {

  @Inject
  AreaDao areaDao;

  /** エリア操作に使う Dao を返します。 */
  @Override
  protected AreaDao getDao() {
    return areaDao;
  }

  /** エリア変換先の型を返します。 */
  @Override
  protected Class<Area> getTypeClass() {
    return Area.class;
  }

  /** 条件付きのエリア一覧をページ情報付きで返します。 */
  @Rls
  @Transactional
  public Page<Area> pagination(Pagination pagination, AreaFilterInput filter) {
    List<Area> areas = areaDao.pagination(pagination, filter).stream()
        .map(record -> record.into(Area.class)).collect(Collectors.toList());
    long total = areaDao.fetchCount(filter);
    int totalPages =
        pagination.getLimit() > 0 ? (int) Math.ceil((double) total / pagination.getLimit()) : 0;

    if (pagination.getOffset() < 0 || pagination.getLimit() <= 0
        || pagination.getOffset() >= total) {
      return new Page<>(Collections.emptyList(), pagination.getOffset(), pagination.getLimit(),
          total, totalPages);
    }

    return new Page<>(areas, pagination.getOffset(), pagination.getLimit(), total, totalPages);
  }

  /** エリアを新規作成して、保存後の値を返します。 */
  @Rls
  @Transactional
  public Area create(AreaInput input) {
    AreaRecord areaRecord = newRecord(input);
    areaRecord.store();
    areaRecord.refresh();
    return areaRecord.into(Area.class);
  }

  /** 既存エリアを更新して、保存後の値を返します。 */
  @Rls
  @Transactional
  public Area update(String id, AreaInput input) {
    AreaRecord areaRecord = areaDao.findOptionalById(id)
        .orElseThrow(() -> new NotFoundException("area not found: " + id));
    areaRecord.from(input);
    areaRecord.store();
    areaRecord.refresh();
    return areaRecord.into(Area.class);
  }

  /** エリアを論理削除します。 */
  @Rls
  @Transactional
  public boolean deleteArea(String id) {
    delete(id);
    return true;
  }

  /** 複数エリアの表示順をまとめて更新します。 */
  @Rls
  @Transactional
  public boolean updateOrders(List<AreaOrderInput> inputs) {
    if (inputs == null || inputs.isEmpty()) {
      return true;
    }

    List<Query> queries = inputs.stream().filter(input -> StringUtils.isNotBlank(input.getId()))
      .map(input -> (Query) dsl().update(com.cxisystem.jooq.tables.Area.AREA)
        .set(com.cxisystem.jooq.tables.Area.AREA.DISPLAY_ORDER, input.getDispOrder())
        .where(com.cxisystem.jooq.tables.Area.AREA.ID.eq(input.getId())))
        .collect(Collectors.toList());

    if (!queries.isEmpty()) {
      dsl().batch(queries).execute();
    }

    return true;
  }
}
