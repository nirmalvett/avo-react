import 'react-dropzone-uploader/dist/styles.css'
import Dropzone from 'react-dropzone-uploader'
import React, {Component} from 'react';


import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import * as Http from '../Http/index'
import {Typography} from "@material-ui/core";

export default class ImageUploader extends React.Component {


    state = {
        images: {} as any
    };

    componentDidMount(): void {
        Http.getImages(
            res => {
                this.setState({images: res.images});
                console.log(res)
            },
            err => console.warn
        )
    }

    render() {
        return (
            <div
                style={{
                    width: '100%',
                    height: '90vh',
                    padding: 25,
                    overflow: 'auto',
                    marginTop: 0,
                }}
            >
                <Card style={{width: '100%', overflow: 'auto', marginBottom: 20}}>
                    <CardContent>
                        <Dropzone
                            getUploadParams={({meta}: any) => {
                                return {url: '/upload '}
                            }}
                            onChangeStatus={({meta, file}: any, status: any) => {
                                console.log(status, meta, file)
                            }}
                            onSubmit={(files: any[]) => {
                                console.log(files.map(f => f.meta))
                            }}
                            accept="image/*,audio/*,video/*"
                        />
                    </CardContent>
                    <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', margin: 10}}>

                        {
                            Object.keys(this.state.images).map(key => {
                                const img = this.state.images[key];
                                const name = img.split('/')[3];
                                return (
                                    <div>
                                        <Typography>{name}</Typography>
                                        <img src={img}/>
                                    </div>
                                )
                            })
                        }
                    </div>
                </Card>
            </div>
        );
    }


}
