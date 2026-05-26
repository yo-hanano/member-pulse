package com.cxisystem.feature.type;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 曜日と時限を含む開校スケジュールテンプレート詳細です。 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchOpeningScheduleTemplateDetail {

  private String id;

  private String name;

  private String note;

  private List<OpeningScheduleDay> days;
}
