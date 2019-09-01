import {GetTest} from '../Http';
import {QuestionManagerState} from '../CourseBuilder/QuestionBuilder/QuestionManager';
import {AvoSet} from '../Http/types';

interface AddStudentsToClass {
    name: 'Add Students To Class';
}

interface BuildQuestion {
    name: 'Build Question';
    questionManagerState: QuestionManagerState;
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
    initWith: [number, number, AvoSet[]];
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

interface TagBuilder {
    name: 'Tag Builder';
}

interface TakeTest {
    name: 'Take Test';
    test: GetTest;
}

export type Section =
    | AddStudentsToClass
    | BuildQuestion
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
    | TagBuilder
    | TakeTest;
