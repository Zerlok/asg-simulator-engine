#ifdef __RELEASE_ASG_ENGINE__

#include <stdexcept>
#include "common/utils.h"
#include "simulator/node_simulator.h"
#include "editor/node_editor.h"


int main(int argc, char *argv[])
{
	const Strings args = stringutils::to_strings(argc, argv);

	if ((argc == 6)
			&& ((args[1] == "-s")
				|| (args[1] == "--simulate")))
	{
		NodeSimulator engine;
		std::cout << "Node Simulator is running..." << std::endl;
		engine.run(args[2], args[3], args[4], args[5]);
		std::cout << "Node Simulator was stopped." << std::endl;

		return 0;
	}

	if ((argc >= 2)
			&& ((args[1] == "-e")
				|| (args[1] == "--editor")))
	{
		if (argc == 4)
		{
			std::ifstream input(args[2]);
			std::ofstream output(args[3]);

			NodeEditor editor(input, output);
			editor.run();

			return 0;
		}
		else if (argc == 2)
		{
			NodeEditor editor(std::cin, std::cout);
			std::cout << "Node Editor is running: use help to see all available commands." << std::endl;
			editor.run();

			return 0;
		}
	}

	std::cout << "Usage: " << args[0] << "[FLAGS] [ARGS...]" << std::endl
			  << "Flags:" << std::endl
			  << " -h|--help     - show this help." << std::endl
			  << " -s|--simulate - run simulator with 4 arguments (filepaths to):" << std::endl
			  << "                 [attacker units] [attacker strategy] [defender units] [defender strategy]" << std::endl
			  << " -e|--editor   - run node editor. 2 arguments are optional:" << std::endl
			  << "                 [input filename] [output filename]" << std::endl;
	return 0;
}


#endif
