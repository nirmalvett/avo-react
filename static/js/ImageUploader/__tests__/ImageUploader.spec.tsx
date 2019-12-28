import {shallow} from 'enzyme';
import * as React from "react";
import ImageUploader from "../ImageUploader";
import {Typography} from "@material-ui/core";

describe('ImageUploader', () => {
    it("Renders", () => {
        const result = shallow(
            <ImageUploader/>
        );
        expect(result).toBeTruthy();
        expect(result.find('#container_image_uploader')).toHaveLength(1);
    });

    it("Renders images", () => {
        const result = shallow(
            <ImageUploader/>
        );

        result.setState({
            images: {
                25: "Avocado_black_32x32.png",
                26: "Avocado_white_32x32.png",
                27: "Avocado_black_1536x1536.png",
                28: "Avocado_transparent_32x32.png",
                29: "Avocado_white_1536x1536.png",
            }
        });

        const imgIDs = [25, 26, 27, 28, 29];
        imgIDs.forEach(id => {
            expect(result.find(`#image_uploader_${id}`).find('img')).toHaveLength(1);
            expect(result.find(`#image_uploader_${id}`).find(Typography)).toHaveLength(1);
        });
        expect(result.find(`#image_uploader_30`)).toHaveLength(0)
    });
});
