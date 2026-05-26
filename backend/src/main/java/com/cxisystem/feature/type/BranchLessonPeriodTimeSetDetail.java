package com.cxisystem.feature.type;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 拠点時限時刻セットと配下の時限別時刻を返す詳細型です。 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchLessonPeriodTimeSetDetail {

  private String id;

  private String branchId;

  private String name;

  private String note;

  private List<BranchLessonPeriodTime> times;
}
