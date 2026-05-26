package com.cxisystem.feature.util;

import java.util.Map;
import org.apache.commons.beanutils.PropertyUtils;

/**
 * Bean の null でないプロパティ名を列挙します。 部分更新や差分反映で使う共通ユーティリティです。
 */
public final class PropertyUtil {

  private PropertyUtil() {}

  /**
   * 指定した Bean の null でないプロパティ名を取得します。
   *
   * @param bean 対象の Bean
   * @return null でないプロパティ名
   */
  public static String[] nonNullPropertyNames(Object bean) {
    try {
      Map<String, Object> props = PropertyUtils.describe(bean);
      return props.entrySet().stream().filter(entry -> entry.getValue() != null)
          .map(Map.Entry::getKey).filter(name -> !"class".equals(name)).toArray(String[]::new);
    } catch (Exception exception) {
      throw new RuntimeException(exception);
    }
  }
}
