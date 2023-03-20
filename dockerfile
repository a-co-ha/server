FROM mhart/alpine-node:9.7.1

# nodemon 설치
# RUN 명령어는 배열로도 사용할 수 있습니다.
RUN yarn global add nodemon

# ADD는 파일을 복사해줍니다.
# 여기서 왼쪽은 호스트 파일의 경로, 오른쪽은 컨테이너의 파일 경로가 됩니다.
# 즉, 현재 프로젝트 디렉토리의 package.json이 컨테이너의 tmp 폴더 아래에 복사됩니다.
COPY ./package.json /tmp/package.json

# 필요한 모듈을 인스톨해줍니다.
RUN cd /tmp && yarn install

# 프로젝트 코드가 위치할 app 폴더를 만들고 node_modules를 복사해줍니다.
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app

# WORKDIR은 경로를 설정한 경로로 고정시켜줍니다.
# Dockerfile의 모든 명령어는 기본적으로 /(루트) 디렉토리에서 실행되므로
# 상당히 유용하게 쓸 수 있습니다.
WORKDIR /usr/src/app

# es6를 사용하기 위한 babel 설정 파일
COPY ./.babelrc /usr/src/app

# package.json을 프로젝트 디렉토리로 복사
COPY ./package.json /usr/src/app

# 이제 src 폴더 아래의 코드를 복사해줍니다.
COPY ./src/ /usr/src/app/

# CMD는 명령어를 배열 형태로 배치해야하며
# 실제로 앱을 실행시키는 커맨드가 들어갑니다.
CMD ["yarn", "start"]