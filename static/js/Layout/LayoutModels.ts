import {GetTest} from '../Http';
import {AvoSet} from '../Http/types';

interface AddStudentsToClass {
    name: 'Add Students To Class';
}

interface BuildQuestion {
    name: 'Build Question';
    s: number;
    q: number;
    sets: AvoSet[];
}

interface ConceptBuilder {
    name: 'Concept Builder';
}

interface CreateTest {
    name: 'Create Test';
    classID: number;
}

interface Documentation {
    name: 'Documentation';
}

interface Explanations {
    name: 'Explanations';
}

interface ExportTools {
    name: 'Export Tools';
}

interface Home {
    name: 'Home';
}

interface InClassTools {
    name: 'In Class Tools';
}

interface Learn {
    name: 'Learn';
}

interface ManageClasses {
    name: 'Manage Classes';
}

interface MarkEditor {
    name: 'Mark Editor';
    takesID: number;
}

interface MyClasses {
    name: 'My Classes';
    _class: number | null;
    _quiz: number | null;
}

interface MyQuestions {
    name: 'My Questions';
    s: number | null;
    q: number | null;
    sets: AvoSet[];
}

interface NotifyClass {
    name: 'Notify Class';
}

interface PostTest {
    name: 'Post Test';
    takesID: number;
}

interface Preferences {
    name: 'Preferences';
}

interface TakeTest {
    name: 'Take Test';
    test: GetTest;
}

export type Section =
    | AddStudentsToClass
    | BuildQuestion
    | ConceptBuilder
    | CreateTest
    | Documentation
    | Explanations
    | ExportTools
    | Home
    | InClassTools
    | Learn
    | ManageClasses
    | MarkEditor
    | MyClasses
    | MyQuestions
    | NotifyClass
    | PostTest
    | Preferences
    | TakeTest;