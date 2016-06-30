#ifdef __RELEASE_ASG_ENGINE__

#include <stdexcept>
#include "common/utils.h"
#include "simulator/node_simulator.h"


int main(int argc, char *argv[])
{
	if (argc != 5)
		throw std::invalid_argument("[attack units txt] [attack strategy txt] [defence units txt] [defence strategy txt]");

	NodeSimulator engine;
	engine.run(argv[1], argv[2], argv[3], argv[4]);

	return 0;
}


#endif
