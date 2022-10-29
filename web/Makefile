SHELL = /bin/sh

# Default configs
SITE_CONF := site.yml
INCLUDES :=
EXCLUDES :=
SRC := src
DATA :=
OUT := out
CACHE := .cache

# User-defined configs
sinclude build.mk

ifneq "${MAKECMDGOALS}" "init"
ifneq "${INCLUDES}" ""
ALL_INCLUDES := $(patsubst %, ${CACHE}/%, $(shell fd -tf . ${INCLUDES}))
endif
GLOBAL_EXCLUDES := *.meta
VARS_SOURCES := ${CACHE}/site.json
ifneq "${DATA}" ""
DATA_SOURCES := $(shell fd -tf -e yml . ${DATA})
DATA_TARGETS := $(patsubst ${DATA}/%.yml, ${CACHE}/data/%.json, ${DATA_SOURCES})
VARS_SOURCES += ${CACHE}/data.json
endif
VARS_TARGET := ${CACHE}/vars.json
ALL_EXCLUDES := $(patsubst %, -E '%', ${GLOBAL_EXCLUDES} ${EXCLUDES})
COPY_SOURCES := $(shell fd -tf . ${SRC} -E '*.j2' ${ALL_EXCLUDES})
TEMPLATE_SOURCES = $(patsubst %.j2, %, $(shell fd -tf -e j2 . ${SRC} ${ALL_EXCLUDES}))
TARGETS = $(patsubst ${SRC}/%,${OUT}/%, ${COPY_SOURCES} ${TEMPLATE_SOURCES})
endif


all: ${VARS_TARGET} ${ALL_INCLUDES} ${TARGETS}

${CACHE}/site.json: ${SITE_CONF}
	@mkdir -p ${CACHE}
	@yj $< | jq '. | { site: . }' > $@

${CACHE}/data/%.json: ${DATA}/%.yml
	@mkdir -p ${CACHE}/data
	@yj $< | jq '. | { $(patsubst %.yml, %, ${<F}): . }' > $@

${CACHE}/data.json: ${DATA_TARGETS}
	@jq -s add $^ | jq '. | { data: . }' > $@

${VARS_TARGET}: ${VARS_SOURCES}
	@jq -s add $^ > $@

${CACHE}/%: %
	@mkdir -p '$(@D)'
	@cp -r '$<' '$@'

${OUT}/%: ${SRC}/%.j2 $(shell test -f ${SRC}/%.meta && echo ${SRC}/%.meta) ${VARS_TARGET} ${ALL_INCLUDES}
	@printf "[jinja] %s > %s\n" '$<' '$@'
	@echo > ${CACHE}/page.json
	@if test -f "$(patsubst %.j2,%.meta,$<)"; then \
		printf "[meta] %s\n" '$(patsubst %.j2,%.meta,$<)'; \
		yj '$(patsubst %.j2,%.meta,$<)' | jq '. | { page: . }' > ${CACHE}/page.json; \
	fi
	@cp '$<' ${CACHE}/input.j2
	@jq -s add ${VARS_TARGET} ${CACHE}/page.json > ${CACHE}/input.json
	@jinja2 --format json '${CACHE}/input.j2' '${CACHE}/input.json' > ${CACHE}/output
	@mkdir -p '$(@D)'
	@cp '${CACHE}/output' '$@'

${OUT}/%: ${SRC}/%
	@printf "[copy] %s > %s\n" '$<' '$@'
	@mkdir -p '$(@D)'
	@cp '$<' '$@'

init:
	@if test ! -f "${SITE_CONF}"; then \
		printf "[create] %s\n" '${SITE_CONF}'; \
		printf "%s\n" \
		'title: New Sake Site' \
		'baseurl: ' \
		> ${SITE_CONF}; \
	fi
	@if test ! -f "build.mk"; then \
		printf "[create] %s\n" 'build.mk'; \
		printf "%s\n" \
		'SITE_CONF := ${SITE_CONF}' \
		'INCLUDES := ${INCLUDES}' \
		'EXCLUDES := ${EXCLUDES}' \
		'SRC := ${SRC}' \
		'DATA := ${DATA}' \
		'OUT := ${OUT}' \
		'CACHE := ${CACHE}' \
		> "build.mk"; \
	fi
	@if test ! -d "${SRC}"; then \
		printf "[create] %s\n" '${SRC}/hello.txt.j2'; \
		mkdir -p ${SRC}; \
		printf "%s\n" \
		'Hello, {{ site.title }}' \
		> ${SRC}/hello.txt.j2; \
	fi

.PHONY: init all
