/// <reference path="./interfaces/DragDropInterfaces.ts" />
/// <reference path="./interfaces/project.ts" />
/// <reference path="./state/projectState.ts" />
/// <reference path="./util/validation.ts" />
/// <reference path="./decorators/autobind.ts" />
/// <reference path="./components/base-component.ts" />
/// <reference path="./components/project-input.ts" />
/// <reference path="./components/project-item.ts" />
/// <reference path="./components/project-list.ts" />

namespace DDInterfaces {

	new ProjectInput();
	new ProjectList('active');
	new ProjectList('finished');

}