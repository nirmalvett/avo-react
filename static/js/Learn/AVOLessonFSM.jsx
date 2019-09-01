import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Fade from '@material-ui/core/Fade';
import { FullscreenExit } from "@material-ui/icons";

export default class AVOLessonFSM extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeLesson  : undefined,
        };
    };

    render() {
        return (
            <div
                id="avo-lesson__expanded-card"
                style={{
                    pointerEvents : 'none',
                    transition    : 'transform 500ms ease-out, opacity, 500ms ease-out',
                    background    : 'white',
                    maxHeight     : 'none',
                    overflowY     : 'hidden',
                    position      : 'absolute',
                    opacity       : 0,
                    zIndex        : 99,
                }}
                className="avo-card"
            >
                <div id="FSM-inner__content-div" style={{ transition : 'opacity 0.3s' }}>
                    {!!this.state.activeLesson && (
                        <Fade in={!!this.state.activeLesson} timeout={{ enter : 500 }}>
                            <Grid
                                container
                                md={12}
                                style={{
                                    paddingBottom: 0,
                                    position : 'relative',
                                    display: 'flex',
                                    padding : '1em',
                                    width : '98% !important',
                                    flex: 1,
                                }}
                            >
                                {this.props.children}
                                <IconButton
                                    onClick={() => this.closeFSM("avo-lesson__expanded-card")}
                                    color="primary"
                                    style={{ float : 'right', position : 'absolute', top : '0.0em', right : '0.0em' }}
                                >
                                    <FullscreenExit color="primary" />
                                </IconButton>
                            </Grid>
                        </Fade>
                    )}
                </div>
            </div>
        );
    }

    handleFSM(event, lesson, LIndex) {
        if(!this.state.activeClass) {
            var $this         = document.getElementById("avo-lesson__expanded-card");
            var $cont         = document.getElementById("avo-lesson__layout-div");
            var $card         = document.getElementById(`avo-lesson__card-${LIndex}`);
            this.cardPosition = $card.getBoundingClientRect();
            this.cardSize     = {
                width  : $cont.clientWidth,
                height : $cont.clientHeight
            };
            this.scaleX = parseFloat(
                parseInt($card.clientWidth ) /
                parseInt(this.cardSize.width )
            );
            this.scaleY = parseFloat(
                parseInt($card.clientHeight) /
                parseInt(this.cardSize.height)
            );
            $this.style.position        = "absolute";
            $this.style.opacity         = '0';
            $this.style.width           = '95%';
            $this.style.height          = '90%';
            $this.style.transformOrigin = `${Math.abs(this.cardPosition.left)}px ${Math.abs(this.cardPosition.top) - 25}px`;
            $this.style.pointerEvents   = 'auto';
            $this.style.transform       = `scale(${this.scaleX}, ${this.scaleY})`;

            document.getElementById('FSM-inner__content-div').style.opacity = "0";
            setTimeout(() => {
                this.setState({ activeLesson : lesson });
            }, 900);
            setTimeout(() => {
                this.openFSM(event, "avo-lesson__expanded-card");
            }, 600);
        } else {
            this.closeFSM("avo-lesson__expanded-card");
        }
    }

    openFSM(event, cardID) {
        var $this = document.getElementById(cardID);

        setTimeout(function(){
            $this.style.opacity   = '1';
            $this.style.top       = '0px';
            $this.style.left      = '-5px';
            $this.style.transform = `scale(1, 1)`;
            document.getElementById('FSM-inner__content-div').style.opacity = "1";
        }, 0);
    };

    closeFSM(cardID){
        this.props.changeToNewMastery();
        var $this = document.getElementById(cardID);
        const _this = this;
        setTimeout(function(){
            $this.style.position      = "absolute";
            $this.style.margin        = '16px';
            $this.style.transform     = `scale(${_this.scaleX}, ${_this.scaleY})`;
            $this.style.opacity       = '0';
            $this.style.pointerEvents = 'none';
            document.getElementById('FSM-inner__content-div').style.opacity = "0";
        }, 100);
        setTimeout(() => {
            _this.setState({
                activeLesson : undefined,
            });
        }, 220);
    };
};
