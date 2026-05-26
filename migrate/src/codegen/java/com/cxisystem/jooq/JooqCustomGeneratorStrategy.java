package com.cxisystem.jooq;

import org.jooq.codegen.DefaultGeneratorStrategy;
import org.jooq.meta.Definition;

public class JooqCustomGeneratorStrategy extends DefaultGeneratorStrategy {
  @Override
  public String getJavaPackageName(Definition definition, Mode mode) {
    String base = super.getJavaPackageName(definition, mode);
    if (mode == Mode.POJO) {
      // POJOの時だけパッケージを変更
      return "com.cxisystem.feature.type";
    }
    return base;
  }
}
