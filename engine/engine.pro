TEMPLATE = app
CONFIG += console gnu++11
CONFIG -= app_bundle
CONFIG -= qt

QMAKE_CXXFLAGS += -std=gnu++11

SOURCES += \
	common/point.cpp \
	common/singleton.cpp \
	common/utils.cpp \
	core/types.cpp \
	unit/abstract_unit.cpp \
	unit/unit_reader.cpp \
	node/abstract_node.cpp \
	node/root_node.cpp \
    node/cmd_move_node.cpp \
	node/cmd_hold_node.cpp \
	node/cmd_fire_node.cpp \
    node/units_select_node.cpp \
	node/end_node.cpp \
	node/node_utils.cpp \
	simulator/node_simulator.cpp \
    editor/node_editor.cpp \
	editor/node_reader_writer.cpp \
	validator/node_validator.cpp \
	node/node_expression.cpp \
	main.cpp \
	gtest.cpp \
    node/test_node.cpp \
    unit/battleship_unit.cpp \
    unit/normal_unit.cpp \
    unit/test_unit.cpp \
    unit/fighter_unit.cpp \
    unit/unit_stats.cpp
#    core/config.cpp

HEADERS += \
	common/point.h \
	common/range.h \
	common/singleton.h \
	common/factory.h \
	common/utils.h \
	core/types.h \
	core/factories.h \
	unit/abstract_unit.h \
	unit/unit_reader.h \
	node/abstract_node.h \
	node/root_node.h \
    node/cmd_move_node.h \
	node/cmd_hold_node.h \
	node/cmd_fire_node.h \
    node/units_select_node.h \
	node/end_node.h \
	node/node_utils.h \
	simulator/node_simulator.h \
	editor/node_reader_writer.h \
    editor/node_editor.h \
	validator/node_validator.h \
	node/node_expression.h \
    node/test_node.h \
    unit/battleship_unit.h \
    unit/unit_stats.h \
    unit/normal_unit.h \
    unit/test_unit.h \
    unit/fighter_unit.h
#    core/config.h


OTHER_FILES += \
	../strategies/defence_units.txt \
	../strategies/defence_strategy.txt \
	../strategies/attack_strategy.txt \
	../strategies/attack_units.txt
