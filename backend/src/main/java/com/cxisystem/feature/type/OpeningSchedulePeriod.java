package com.cxisystem.feature.type;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 開校曜日で利用する時限を返す型です。 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OpeningSchedulePeriod {

  private String lessonPeriodId;
}
