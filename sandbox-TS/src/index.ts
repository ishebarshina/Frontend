enum ProjectStatus { Active, Finished }

class Project {
	constructor(
		public id: string,
		public title: string,
		public description: string,
		public people: number,
		public status: ProjectStatus
	) {

	}
}

type Listener = (items: Project[]) => void;

// Project State Management class
// singleton
class ProjectState {
	private listeners: Listener[] = [];

	private projects: Project[] = [
		// list of projects here
	]

	private static instance: ProjectState;

	private constructor() {

	}

	static getInstance() {
		if (this.instance) {
			return this.instance;
		}
		this.instance = new ProjectState;
		return this.instance;
	}

	public addProject(title: string,
		description: string,
		numOfPeople: number) {
		const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active);
		this.projects.push(newProject);
		for (const listenerFn of this.listeners) {
			listenerFn(this.projects.slice());
		}
	}

	public addListener(listenerFn: Listener) {
		this.listeners.push(listenerFn);
	}
}

const projectState = ProjectState.getInstance();

class ProjectList {
	templateElement: HTMLTemplateElement;
	hostElement: HTMLDivElement;
	element: HTMLElement;
	assignedProjects: Project[];

	constructor(private type: 'active' | 'finished') {
		this.templateElement = document.getElementById(
			'project-list'
		)! as HTMLTemplateElement;
		this.hostElement = document.getElementById('app')! as HTMLDivElement;
		this.assignedProjects = [];

		const importedNode = document.importNode(
			this.templateElement.content,
			true
		);
		this.element = importedNode.firstElementChild as HTMLElement;
		this.element.id = `${this.type}-projects`;

		projectState.addListener((projects: Project[]) => {
			this.assignedProjects = projects;
			this.renderProjects();
		});

		this.attach()
		this.renderContent();
	}

	renderProjects() {
		const listEl = <HTMLUListElement>document.getElementById(`${this.type}-projects-list`)!;
		listEl.innerHTML = '';
		for (const prjItem of this.assignedProjects) {
			const listItem = document.createElement('li');
			listItem.textContent = prjItem.title;
			listEl.appendChild(listItem);
		}
	}

	private renderContent() {
		const listId = `${this.type}-projects-list`;
		this.element.querySelector('ul')!.id = listId;
		this.element.querySelector('h2')!.textContent =
			this.type.toUpperCase() + ' PROJECTS';

	}

	private attach() {
		this.hostElement.insertAdjacentElement('beforeend', this.element);
	}
}


interface Validatable {
	value: string | number;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
}

function validate(ValidatableInput: Validatable): boolean {
	let isValid = true;
	if (ValidatableInput.required) {
		isValid = isValid && ValidatableInput.value.toString().trim().length !== 0;
	}
	if (ValidatableInput.minLength !== undefined &&
		typeof ValidatableInput.value === 'string') {
		isValid = isValid &&
			ValidatableInput.value.toString().trim().length >= ValidatableInput.minLength;
	}
	if (ValidatableInput.maxLength !== undefined &&
		typeof ValidatableInput.value === 'string') {
		isValid = isValid &&
			ValidatableInput.value.toString().trim().length <= ValidatableInput.maxLength;
	}
	if (ValidatableInput.min != undefined
		&& typeof ValidatableInput.value === 'number') {
		isValid = isValid &&
			ValidatableInput.value >= ValidatableInput.min;
	}
	if (ValidatableInput.max != undefined
		&& typeof ValidatableInput.value === 'number') {
		isValid = isValid &&
			ValidatableInput.value <= ValidatableInput.max;
	}
	return isValid;
}

// autobind decorator
function autobind(
	_: any,
	_2: string,
	descriptor: TypedPropertyDescriptor<any>
) {
	const originalMethod = descriptor.value;
	const adjDescriptor: PropertyDescriptor = {
		configurable: true,
		get() {
			const boundFn = originalMethod.bind(this);
			return boundFn;
		}
	};
	return adjDescriptor;
}

class ProjectInput {
	templateElement: HTMLTemplateElement;
	hostElement: HTMLDivElement;
	element: HTMLFormElement;
	titleInputElement: HTMLInputElement;
	descriptionInputElement: HTMLInputElement;
	peopleInputElement: HTMLInputElement;

	constructor() {
		this.templateElement = document.getElementById(
			'project-input'
		)! as HTMLTemplateElement;
		this.hostElement = document.getElementById('app')! as HTMLDivElement;

		const importedNode = document.importNode(
			this.templateElement.content,
			true
		);
		this.element = importedNode.firstElementChild as HTMLFormElement;
		this.element.id = 'user-input';

		this.titleInputElement = this.element.querySelector(
			'#title'
		) as HTMLInputElement;
		this.descriptionInputElement = this.element.querySelector(
			'#description'
		) as HTMLInputElement;
		this.peopleInputElement = this.element.querySelector(
			'#people'
		) as HTMLInputElement;

		this.configure();
		this.attach();
	}

	private gatherUserInput(): [string, string, number] | void {
		const enteredTitle = this.titleInputElement.value;
		const enteredDescription = this.descriptionInputElement.value;
		const enteredPeople = this.peopleInputElement.value;

		const titleValidatable: Validatable = {
			value: enteredTitle,
			required: true
		};
		const descriptionValidatable: Validatable = {
			value: enteredDescription,
			required: true,
			minLength: 5
		};
		const peopleValidatable: Validatable = {
			value: +enteredPeople,
			required: true,
			min: 1,
			max: 8
		};

		if (
			!validate(titleValidatable) &&
			!validate(descriptionValidatable) &&
			!validate(peopleValidatable)
		) {
			alert('Invalid input');
			// return;
		} else {
			return [enteredTitle, enteredDescription, +enteredPeople];
		}
	}

	private clearInputs(): void {
		this.titleInputElement.value = '';
		this.descriptionInputElement.value = '';
		this.peopleInputElement.value = '';
	}

	@autobind
	private submitHandler(event: Event) {
		event.preventDefault();
		const userInput = this.gatherUserInput();
		if (Array.isArray(userInput)) {
			const [title, desc, people] = userInput;
			projectState.addProject(title, desc, people);
			this.clearInputs();
		}
	}

	private configure() {
		this.element.addEventListener('submit', this.submitHandler);
	}

	private attach() {
		this.hostElement.insertAdjacentElement('afterbegin', this.element);
	}
}

const prjInput = new ProjectInput();


const activeProject = new ProjectList('active');
const finishedProject = new ProjectList('finished');