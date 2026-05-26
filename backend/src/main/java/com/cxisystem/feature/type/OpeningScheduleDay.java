package com.cxisystem.feature.type;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 開校スケジュールの曜日別設定を返す型です。 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OpeningScheduleDay {

  private Short weekday;

  private Boolean isOpen;

  private List<OpeningSchedulePeriod> periods;
}
