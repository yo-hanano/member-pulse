package com.cxisystem.feature.type;

import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 拠点時限時刻セット内の時限別時刻です。 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchLessonPeriodTime {

  private String id;

  private String lessonPeriodId;

  private LocalTime startTime;

  private LocalTime endTime;
}
