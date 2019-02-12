import { Component } from '@angular/core';
import { Statement } from '@angular/compiler';
   
@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent  {
  
  operators = Operator;
  state: State = INITIAL_STATE;
  constructor( ) { }


  clickNumber(num: number) {
    if (this.state.newlyClickedOperator) {
        this.state.value = 0;
        this.state.newlyClickedOperator = false;
    }
    const existingValue = this.state.value;
    let newValue :string;
        if (this.state.hasDot){
            newValue = existingValue.toString() + "." + num.toString();
            this.state.hasDot = false;
        } else {
            newValue = existingValue.toString() + num.toString();
        }
    
    if (newValue.length < 10000000) {
        this.state.value = Number(newValue);
        this.state.newlyClickedNumber = true;
    }
  }

  clickOperator(operator: Operator) {
    switch (operator) {
        case Operator.add:
            this.updateStateOperations(this.state);
            this.displayLastPossibleValue();
            this.state.operator = operator;
            break;
        case Operator.minus:
            this.updateStateOperations(this.state);
            this.displayLastPossibleValue();
            this.state.operator = operator;
            break;
        case Operator.multiply:
            this.updateStateOperations(this.state);
            this.displayLastPossibleValue(true);
            this.state.operator = operator;
            break;
        case Operator.divide:
            this.updateStateOperations(this.state);
            this.displayLastPossibleValue(true);
            this.state.operator = operator;
            break;
        case Operator.equal:
            this.updateStateOperations(this.state, operator);
            this.state.operator = operator;
            this.state.value = this.evaluateOperations(this.state.operations);
            this.state.displayValue = null;
            this.state.operations = [];
            break;
        case Operator.allClear:
            this.resetState();
            break;
        case Operator.clear:
            this.state.value = 0;
            break;
        case Operator.dot:
            this.state.hasDot = true;
            break;
    }
    console.log(this.state);
}

updateStateOperations(state: State, operator?: Operator) {
    if (this.onlyChangingOperator(state) && operator !== Operator.equal) {
        return;
    }

    this.state.newlyClickedNumber = false;
    this.state.newlyClickedOperator = true;
    this.state.hasDot = false;
    this.state.decimalLength = 0;

    let newOperation: Operation = null;
    if (state.operator === Operator.none
        || state.operator === Operator.equal
        || state.operator === Operator.allClear
        || state.operator === Operator.clear) {
        newOperation = {
            value: state.value,
            func: add,
            operations: [],
        };
        state.operations.push(newOperation);
    }

    if (state.operator === Operator.add
        || state.operator === Operator.minus) {
        const func = this.getFuncForOperator(state.operator);
        newOperation = {
            value: state.value,
            func: func,
            operations: [],
        };
        state.operations.push(newOperation);
    }

    if (state.operator === Operator.multiply
        || state.operator === Operator.divide) {
        const func = this.getFuncForOperator(state.operator);
        newOperation = {
            value: state.value,
            func: func,
            operations: [],
        };
        const lastOperation = state.operations[state.operations.length - 1];
        lastOperation.operations.push(newOperation);
    }
}

isMathematicOperator(operator: Operator) {
    return operator === Operator.add ||
        operator === Operator.minus ||
        operator === Operator.multiply ||
        operator === Operator.divide;
}

onlyChangingOperator(state: State) {
    if (this.isMathematicOperator(state.operator) &&
        state.newlyClickedNumber === false) {
        return true;
    }
    return false;
}

resetState() {
    this.state.operations = [];
    this.state.newlyClickedOperator = false;
    this.state.newlyClickedNumber = true;
    this.state.value = 0;
    this.state.displayValue = null;
    this.state.operator = Operator.none;
    this.state.hasDot = false;
    this.state.decimalLength = 0;
}

evaluateOperations(operations: Operation[], onlyChildren = false) {
    const arr = [];
    let result = 0;
    operations.forEach(oper => {
        const operFuncs = oper.operations.map(x => x.func(x.value));
        if ((operFuncs && operFuncs.length > 0) || onlyChildren) {
            arr.push(oper.func(chain(...operFuncs)(oper.value)));
        } else {
            arr.push(oper.func(oper.value));
        }
    });
    if (arr && arr.length > 0) {
        const items = (onlyChildren && [arr[arr.length - 1]]) || arr;
        result = chain(...items)(0);
    }
    return result;
}

getFuncForOperator(operator: Operator) {
    switch (operator) {
        case Operator.add:
            return add;
        case Operator.minus:
            return minus;
        case Operator.multiply:
            return multiply;
        case Operator.divide:
            return divide;
    }
}

isActiveOperator(operator: Operator) {
    return this.state.operator === operator && this.state.newlyClickedOperator;
}

getDisplayValue() {
    let result = 0;
    if (this.state.newlyClickedNumber) {
        result = this.state.value;
    } else {
        result = this.state.displayValue || this.state.value;
    }
    return result;
}

displayLastPossibleValue(onlyChildren = false) {
    if (this.state.operations) {
        const latestValue = this.evaluateOperations(this.state.operations, onlyChildren);
        this.state.value = latestValue;
    }
}


}

function add(a: number): (b: number) => number {
return (b) => a + b;
}

function minus(a: number): (b: number) => number {
return (b) => b - a;
}

function multiply(a: number): (b: number) => number {
return (b) => a * b;
}

function divide(a: number): (b: number) => number {
return (b) => b / a;
}

function chain(...fns: ((a: number) => number)[]): (b: number) => number {
return (b: number): number => fns.reduce((cur, fn) => fn(cur), b);
}

  export enum Operator {
    none = 'none',
    divide = 'divide',
    multiply = 'multiply',
    minus = 'minus',
    add = 'add',
    equal = 'equal',
    clear = 'clear',
    dot = 'dot',
    allClear = 'allClear',
}

const INITIAL_STATE: State = {
    value: 0,
    displayValue: null,
    operator: Operator.none,
    newlyClickedOperator: false,
    newlyClickedNumber: false,
    operations: [],
    hasDot: false,
    decimalLength: 0
};

export interface State {
    value: number;
    displayValue: number;
    operator: Operator;
    newlyClickedOperator: boolean;
    newlyClickedNumber: boolean;
    operations: Operation[];
    hasDot: boolean;
    decimalLength: number;
}

interface Operation {
  value: number;
  func: ((a: number) => (b: number) => number);
  operations: Operation[];
}



