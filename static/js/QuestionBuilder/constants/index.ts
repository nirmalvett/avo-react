import {BINARY_OPERATORS, REMAPPED_BINARY_OPERATORS} from './OperatorsBinary';
import {PREFIX_OPERATORS, REMAPPED_PREFIX_OPERATORS} from './OperatorsPrefix';
import {POSTFIX_OPERATORS, REMAPPED_POSTFIX_OPERATORS} from './OperatorsPostfix';
import {generate} from './Regex';

export * from './Constants';
export * from './Functions';
export * from './Separators';
export * from './OperatorsBinary';
export * from './OperatorsPostfix';
export * from './OperatorsPrefix';

export const OPERATORS = {
    ...BINARY_OPERATORS,
    ...PREFIX_OPERATORS,
    ...POSTFIX_OPERATORS,
};

export const REMAPPED_OPERATORS = {
    ...REMAPPED_BINARY_OPERATORS,
    ...REMAPPED_PREFIX_OPERATORS,
    ...REMAPPED_POSTFIX_OPERATORS,
};

export const {unaryRegex, REPLACE, functionRegex, REGEX} = generate();
