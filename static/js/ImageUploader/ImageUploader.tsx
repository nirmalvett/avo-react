require('react-dropzone-uploader/dist/styles.css')
import Dropzone from 'react-dropzone-uploader'
import React, {Component} from 'react';

import {BASE_URL} from '../Http/baseRequest'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import * as Http from '../Http/index'
import {Typography} from "@material-ui/core";

export default class ImageUploader extends React.Component<{ showCard?: boolean }, { images: Object }> {

    constructor(props: any) {
        super(props)
    }

    state = {
        images: {} as any
    };

    componentDidMount(): void {
        this.getImages()
    }

    getImages = () => {
        Http.getImages(
            res => {
                this.setState({images: res.images});
            },
            err => console.warn
        )
    };

    render() {
        return (
            <div
                id='container_image_uploader'
                style={this.props.showCard ? {
                    width: '100%',
                    padding: 25,
                    overflow: 'auto',
                    marginTop: 0,
                } : {padding: 1, margin: 0, overflow: 'auto',}}
            >
                <Card style={{width: '100%'}}>
                    <CardContent>
                        <Dropzone
                            getUploadParams={({meta}: any) => {
                                return {url: '/upload/image'}
                            }}
                            onChangeStatus={({meta, file}: any, status: any) => {
                            }}
                            onSubmit={(files: any[]) => {
                                this.getImages();
                            }}
                            accept="image/*"
                        />
                        <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', margin: 10}}>

                            {
                                Object.keys(this.state.images).map(key => {
                                    const name = this.state.images[key];
                                    return (
                                        <div key={`image_uploader_${key}`} id={`image_uploader_${key}`}>
                                            <Typography>{name}</Typography>
                                            <img alt={name} src={`${BASE_URL}/image/${name}`}/>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }


}
