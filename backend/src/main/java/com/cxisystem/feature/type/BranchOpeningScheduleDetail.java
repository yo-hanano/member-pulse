package com.cxisystem.feature.type;

import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 曜日と時限を含む拠点通常開校スケジュール詳細です。 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchOpeningScheduleDetail {

  private String id;

  private String branchId;

  private LocalDate effectiveFrom;

  private LocalDate effectiveTo;

  private String timeSetId;

  private String note;

  private List<OpeningScheduleDay> days;
}
