# Base image
FROM mcr.microsoft.com/devcontainers/base:noble

USER root
RUN apt-get update && \
  apt-get install -y curl ca-certificates unzip xz-utils && \
  sed -i 's/^# *ja_JP.UTF-8 UTF-8/ja_JP.UTF-8 UTF-8/' /etc/locale.gen && \
  locale-gen ja_JP.UTF-8 && \
  update-locale LANG=ja_JP.UTF-8 LC_ALL=ja_JP.UTF-8 && \
  rm -rf /var/lib/apt/lists/*

ENV LANG=ja_JP.UTF-8
ENV LANGUAGE=ja_JP:ja
ENV LC_ALL=ja_JP.UTF-8

RUN ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
  echo "Asia/Tokyo" > /etc/timezone

ENV MISE_INSTALL_PATH=/usr/local/bin/mise
ENV MISE_DATA_DIR=/home/vscode/.local/share/mise
ENV MISE_CONFIG_DIR=/home/vscode/.config/mise
ENV PATH=/home/vscode/.local/share/mise/shims:/home/vscode/.local/bin:$PATH

RUN curl https://mise.run | sh && \
  printf '\neval "$(/usr/local/bin/mise activate bash)"\n' >> /etc/bash.bashrc && \
  printf '\neval "$(/usr/local/bin/mise activate zsh)"\n' >> /etc/zsh/zshrc

USER vscode
WORKDIR /workspace
USER root
