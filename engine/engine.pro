TEMPLATE = app
CONFIG += console gnu++11
CONFIG -= app_bundle
CONFIG -= qt

QMAKE_CXXFLAGS += -std=gnu++11

SOURCES += main.cpp \
	common/point.cpp \
	common/singleton.cpp \
	common/utils.cpp \
	core/coretypes.cpp \
	core/simulator.cpp \
	unit/abstract_unit.cpp \
	unit/normal_unit.cpp \
	unit/unit_reader.cpp \
	node/abstract_node.cpp \
    node/cmd_move_node.cpp \
	node/cmd_hold_node.cpp \
	node/cmd_fire_node.cpp \
    node/node_reader.cpp \
    node/root_node.cpp \
    node/units_select_node.cpp \
    node/end_node.cpp \
	node/node_utils.cpp
#    core/config.cpp

HEADERS += \
	common/point.h \
	common/range.h \
	common/singleton.h \
	common/factory.h \
	common/utils.h \
	core/coretypes.h \
	core/factories.h \
	core/simulator.h \
	unit/abstract_unit.h \
	unit/normal_unit.h \
	unit/unit_reader.h \
	node/abstract_node.h \
    node/cmd_move_node.h \
	node/cmd_hold_node.h \
	node/cmd_fire_node.h \
    node/node_reader.h \
    node/root_node.h \
    node/units_select_node.h \
    node/end_node.h \
	node/node_utils.h
#    core/config.h


OTHER_FILES += \
    ../../engine/debug/defence_units.txt \
    ../../engine/debug/defence_strategy.txt \
    ../../engine/debug/attack_strategy.txt \
    ../../engine/debug/attack_units.txt
