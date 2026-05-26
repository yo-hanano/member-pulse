package com.cxisystem.feature.resolver;

import io.quarkus.virtual.threads.VirtualThreads;
import jakarta.inject.Inject;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.function.Supplier;
import org.eclipse.microprofile.context.ThreadContext;

/**
 * GraphQL Resolver の共通基底。 DataLoader や非同期処理を仮想スレッドで動かすときの入口を揃える。
 */
public abstract class AbstractResolver {

  @Inject
  @VirtualThreads
  ExecutorService virtualThreadExecutor;

  @Inject
  ThreadContext threadContext;

  /** 仮想スレッド上でコンテキストを引き継いだ非同期処理を実行します。 */
  protected <T> CompletableFuture<T> vtSupplyAsync(Supplier<T> supplier) {
    return CompletableFuture.supplyAsync(threadContext.contextualSupplier(supplier),
        virtualThreadExecutor);
  }
}
