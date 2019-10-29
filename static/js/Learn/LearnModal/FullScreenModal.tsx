import React, {PureComponent} from 'react';
import {Fade, IconButton, Paper} from '@material-ui/core';
import {FullscreenExit} from '@material-ui/icons';

interface FullScreenModalProps {
    readonly sourceID: string | undefined;
    readonly onClose: () => void;
}

export default class FullScreenModal extends PureComponent<FullScreenModalProps> {
    transform: string = '';

    render() {
        const {sourceID, children} = this.props;
        const border = (16 + 1) * 2;
        return (
            <Paper
                id='avo-lesson__expanded-card'
                style={{
                    pointerEvents: 'none',
                    transition: 'transform 500ms ease-out, opacity, 500ms ease-out',
                    maxHeight: 'none',
                    overflowY: 'hidden',
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    opacity: 0,
                    zIndex: 99,
                    display: 'flex',
                    margin: 0,
                    padding: 0,
                    width: `calc(100% - ${border}px)`,
                    height: `calc(100% - ${border}px)`,
                    transformOrigin: '0 0',
                }}
                className='avo-card'
            >
                <div
                    id='FSM-inner__content-div'
                    style={{
                        transition: 'opacity 0.3s',
                        display: 'flex',
                        flexDirection: 'row',
                        flex: 1,
                        padding: '16px',
                    }}
                >
                    {sourceID && (
                        <Fade in={!!sourceID} timeout={{enter: 500}}>
                            <div
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'row',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                {children}
                                <IconButton
                                    onClick={this.closeFSM}
                                    color='primary'
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                    }}
                                >
                                    <FullscreenExit color='primary' />
                                </IconButton>
                            </div>
                        </Fade>
                    )}
                </div>
            </Paper>
        );
    }

    componentDidUpdate(prevProps: FullScreenModalProps) {
        if (!prevProps.sourceID && this.props.sourceID) {
            this.openFSM(this.props.sourceID);
        } else if (prevProps.sourceID && !this.props.sourceID) {
            this.closeFSM();
        }
    }

    openFSM(sourceID: string) {
        const $this = document.getElementById('avo-lesson__expanded-card') as HTMLElement;
        const $innerContent = document.getElementById('FSM-inner__content-div') as HTMLElement;

        $this.style.opacity = '0';
        $this.style.pointerEvents = 'auto';
        $this.style.transform = this.transform = getTransform(sourceID);

        $innerContent.style.opacity = '0';
        setTimeout(() => {
            $this.style.opacity = '1';
            $this.style.transform = `scale(1, 1)`;
            $innerContent.style.opacity = '1';
        }, 600);
    }

    closeFSM = () => {
        const $this = document.getElementById('avo-lesson__expanded-card') as HTMLElement;
        const $innerContent = document.getElementById('FSM-inner__content-div') as HTMLElement;
        const transform = this.transform;
        setTimeout(function() {
            $this.style.transform = transform;
            $this.style.opacity = '0';
            $this.style.pointerEvents = 'none';
            $innerContent.style.opacity = '0';
        }, 100);
        setTimeout(this.props.onClose, 220);
    };
}

function getTransform(sourceID: string) {
    const $this = document.getElementById('avo-lesson__expanded-card') as HTMLElement;
    const $sharedParent = $this.parentElement as HTMLElement;
    const sharedParentPosition = $sharedParent.getBoundingClientRect();
    const $source = document.getElementById(sourceID) as HTMLElement;
    const sourcePosition = $source.getBoundingClientRect();

    const scaleX = $source.clientWidth / $this.clientWidth;
    const scaleY = $source.clientHeight / $this.clientHeight;
    const xOffset = sourcePosition.left - sharedParentPosition.left - 16 + 1;
    const yOffset = sourcePosition.top - sharedParentPosition.top - 16 + 1;
    $this.style.opacity = '0';
    $this.style.pointerEvents = 'auto';
    return `translate(${xOffset}px, ${yOffset}px) scale(${scaleX}, ${scaleY})`;
}
