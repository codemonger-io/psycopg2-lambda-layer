ARG PLATFORM=linux/arm64
ARG IMAGE=public.ecr.aws/sam/build-python3.8
FROM --platform=$PLATFORM $IMAGE
ARG PLATFORM
ARG POSTGRES_TAG=REL_15_1
ARG PATCHELF_TAG=0.17.0
ARG PSYCOPG_TAG=2_9_5

RUN yum update -y
RUN yum -q list installed rsync &> /dev/null || yum install -y rsync
RUN yum -q list installed openssl-devel &> /dev/null || yum install -y openssl-devel

# builds libpq
WORKDIR /var
RUN curl -sL https://github.com/postgres/postgres/archive/$POSTGRES_TAG.tar.gz \
	| tar xzf -
WORKDIR postgres-$POSTGRES_TAG
RUN ./configure --prefix=/usr/local --libdir=/usr/lib64 --without-readline --with-openssl
RUN make -C src/interfaces/libpq install
RUN make -C src/bin/pg_config install
RUN make -C src/include install

# builds patchelf
WORKDIR /var
RUN curl -sL https://github.com/NixOS/patchelf/archive/$PATCHELF_TAG.tar.gz \
	| tar xzf -
WORKDIR patchelf-$PATCHELF_TAG
RUN ./bootstrap.sh
RUN ./configure
RUN make
RUN make check
RUN make install

RUN find /usr/local -name \*.so.\* -type f -exec strip --strip-unneeded {} \;

# builds psycopg2
WORKDIR /var
RUN curl -sL https://github.com/psycopg/psycopg2/archive/$PSYCOPG_TAG.tar.gz \
	| tar xzf -
WORKDIR psycopg2-$PSYCOPG_TAG
RUN pip install --upgrade pip
RUN pip install auditwheel
RUN pip wheel . -w ./dist/
# bundles all the necessary shared objects
RUN auditwheel repair --plat `if [ $PLATFORM = "linux/arm64" ]; then echo "linux_aarch64"; else echo "linux_x86_64"; fi` ./dist/*.whl -w ./dist/
RUN pip install -t /var/packaged ./dist/*-`if [ $PLATFORM = "linux/arm64" ]; then echo "linux_aarch64"; else echo "linux_x86_64"; fi`.whl

CMD ["python"]
