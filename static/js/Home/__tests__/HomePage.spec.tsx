import {shallow} from 'enzyme';
import * as React from "react";
import HomePageOld from "../HomePageOld";

it("Renders", () => {
    const result = shallow(
        <HomePageOld/>
    );
    expect(result).toBeTruthy();
});