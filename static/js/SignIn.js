import React from 'react';
import Http from './Http';
import Logo from './Logo';
import Card from '@material-ui/core/Card/Card';
import Grid from '@material-ui/core/Grid/Grid';
import Button from '@material-ui/core/Button/Button';
import TextField from '@material-ui/core/TextField/TextField';
import Typography from '@material-ui/core/Typography/Typography';
import Modal from '@material-ui/core/Modal';
import AVOModal from './AVOMatComps/AVOMatModal';

export default class SignIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isSigningIn: true,
            rFirstName: '',
            rLastName: '',
            rEmail: '',
            rPassword1: '',
            rPassword2: '',
            username: this.props.username,
            password: this.props.password,
        };
    }

    render() {
        let style = {'width': '100%'};

        let updateFirstName = (e) => this.setState({rFirstName: e.target.value});
        let updateLastName = (e) => this.setState({rLastName: e.target.value});
        let updateEmail = (e) => this.setState({rEmail: e.target.value.toLowerCase()});
        let updatePassword1 = (e) => this.setState({rPassword1: e.target.value});
        let updatePassword2 = (e) => this.setState({rPassword2: e.target.value});

        let updateUsername = (e) => this.setState({username: e.target.value});
        let updatePassword = (e) => this.setState({password: e.target.value});

        let emailError = this.state.rEmail.length > 0 && !/^[a-zA-Z]{2,}\d*@uwo\.ca$/.test(this.state.rEmail);
        let rPw1Error = this.state.rPassword1.length > 0 && this.state.rPassword1.length < 8;
        let rPw2Error = this.state.rPassword2.length > 0 && this.state.rPassword2 !== this.state.rPassword1;

        let usernameError = this.state.username.length > 0 && !/^[a-zA-Z]{2,}\d*@uwo\.ca$/.test(this.state.username);
        let passwordError = this.state.password.length > 0 && this.state.password.length < 8;

        return (
            <Card className='LoginCard' id='avo-registrator'>
                <Grid container spacing={24} style={{'margin': '5%', 'width': '90%', 'height': '90%'}}>
                    <Grid item xs={12}>                    
                    {!this.state.isSigningIn ? (
                        <React.Fragment>
                            <Typography variant='headline'>
                                Register
                            </Typography>
                            <form style={{'width': '100%'}}>
                                <TextField 
                                    margin='normal' 
                                    style={style} 
                                    label='First Name' 
                                    onChange={updateFirstName}
                                    value={this.state.rFirstName}
                                />
                                <br/>
                                <TextField 
                                    margin='normal' 
                                    style={style} 
                                    label='Last Name' 
                                    onChange={updateLastName}
                                    value={this.state.rLastName}
                                />
                                <br/>
                                <TextField 
                                    margin='normal' 
                                    style={style} 
                                    label='UWO Email' 
                                    onChange={updateEmail}
                                    value={this.state.rEmail} error={emailError}
                                />
                                <br/>
                                <TextField 
                                    margin='normal' 
                                    style={style} 
                                    label='Password'
                                    type='password'
                                    onChange={updatePassword1} value={this.state.rPassword1} 
                                    error={rPw1Error}
                                    helperText='(Minimum 8 characters)'
                                />
                                <br/>
                                <TextField 
                                    margin='normal' 
                                    style={style} 
                                    label='Re-Enter Password' 
                                    type='password'
                                    onChange={updatePassword2} 
                                    value={this.state.rPassword2} 
                                    error={rPw2Error}
                                />
                                <br/>
                                <Typography variant='caption'>
                                    By creating an account you agree to the Terms of Service found <a id='ToC-here'>here.</a>
                                </Typography>
                                <Button 
                                    color='primary' 
                                    className="avo-button avo-styles__float-right" 
                                    onClick={() => this.register()}>
                                    Register
                                </Button>
                            </form>
                            <AVOModal 
                                title='Terms of Service'
                                target="ToC-here"
                                acceptText='I Agree'
                                declineText='Decline'
                                onAccept={() => {}}
                                onDecline={() => {}}
                            >
                                {this.getTermsOfService()}
                            </AVOModal>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            {/* <div className="avo-mascot">
                                <section className="move-area">
                                    <div className='eye-brow left'></div>
                                    <div className='eye-brow right'></div>
                                    <div className='eye'></div>
                                    <div className='eye'></div>
                                    <div className='mouth'></div>
                                </section>
                            </div> */}
                            <Typography variant='headline'>
                                Sign In
                            </Typography>
                            <form style={style} noValidate autoComplete='off'>
                                <TextField 
                                    margin='normal' 
                                    style={style} 
                                    label='Email'
                                    onChange={updateUsername} 
                                    value={this.state.username} 
                                    error={usernameError}
                                />
                                <br/>
                                <TextField 
                                    margin='normal' 
                                    style={style} 
                                    label='Password' 
                                    type='password'
                                    onChange={updatePassword} 
                                    value={this.state.password} error={passwordError}
                                />
                                <br/>
                                <br/>
                                <Button 
                                    color='primary' 
                                    className="avo-button" 
                                    onClick={() => this.forgotPassword()}>
                                    Forgot Password
                                </Button>
                                <Button 
                                    color='primary' 
                                    className="avo-button" 
                                    onClick={() => 
                                    this.signIn()}>
                                    Sign In
                                </Button>
                            </form>
                        </React.Fragment>
                    )} 
                    <br/>
                    <br/>
                    <footer className='avo-styles__footer'>
                        <Typography variant='caption'>
                            {this.state.isSigningIn ? 'Don\'t have an Account? Click ' : 'Already have an Account? Click '}   
                            <a 
                                className="avo-styles__link"
                                onClick={() => this.setState({ isSigningIn : !this.state.isSigningIn })}
                                >
                                here.
                            </a>                     
                        </Typography>
                    </footer>
                    </Grid>
                </Grid>
            </Card>
        );
    }

    // noinspection JSMethodCanBeStatic
    register() {
        let s = this.state;
        if (/^[a-zA-Z]{2,}\d*@uwo\.ca$/.test(s.rEmail) && s.rPassword1.length >= 8 && s.rPassword2 === s.rPassword1) {
            Http.register(s.rFirstName, s.rLastName, s.rEmail, s.rPassword1,
                () => {this.setState({rFirstName: '', rLastName: '', rEmail: '', rPassword1: '', rPassword2: '',
                    username: s.rEmail, password: s.rPassword1})},
                (result) => {
                    alert(result.error);
                }
            );
        }
    }

    // noinspection JSMethodCanBeStatic
    forgotPassword() {
        alert('Coming Soon!'); // Todo
    };

    // noinspection JSMethodCanBeStatic
    signIn() {
        Http.login(this.state.username, this.state.password, () => {
            this.props.login(this.state.username, this.state.password);
            }, (result) => {
            alert(result.error)
            }
        );
    };

    getTermsOfService() {
        return (
           <p className='ToC'> 
            <br/><br/>
            1.     Under this End User License Agreement (the “Agreement”), AvocadoCore (the “Vendor”) grants tothe user (the “Licensee”) a non-exclusive and non-transferable license (the “License”) to use AVO(the “Software”).
            <br/><br/>
            2.     “Software” includes the executable computer programs and any related printed, electronic and onlinedocumentation and any other files that may accompany the product.
            <br/><br/>
            3.     Title, copyright, intellectual property rights and distribution rights of the Software remainexclusively with the Vendor. Intellectual property rights include the look and feel of the Software.
            <br/><br/>
            4.     The rights and obligations of this Agreement are personal rights granted to the Licensee only. TheLicensee may not transfer or assign any of the rights or obligations granted under this Agreement toany other person or legal entity. The Licensee may not make available the Software for use by one ormore third parties.
            <br/><br/>
            5.     The Software may not be modified, reverse-engineered, or de-compiled in any manner throughcurrent or future available technologies.
            <br/><br/>
            6.     Failure to comply with any of the terms under the License section will be considered a materialbreach of this Agreement.License Fee
            <br/><br/>
            7.     The original purchase price paid by the Licensee will constitute the entire license fee and is the fullconsideration for the Agreement.Limitation of Liability
            <br/><br/>
            8.     The Software is provided by the Vendor and accepted by the Licensee “as is”. Liability of the Vendor will be limited to a maximum of the original purchase price of the Software. The Vendor will not be liable for any general, special, incidental or consequential damages including, but not limitedto, loss of productions, loss of profits, loss of revenue, loss of data, or any other business or economicdisadvantage suffered by the Licensee arising out of the use or failure to use the Software.
            <br/><br/>
            9.     The Vendor makes no warranty expressed or implied regarding the fitness of the Software for aparticular purpose or that the Software will be suitable or appropriate for the specific requirements ofthe Licensee.
            <br/><br/>
            10.    The Vendor does not warrant that use of the Software will be uninterrupted or error-free. TheLicensee accepts that software in general is prone to bugs and flaws within an acceptable level asdetermined in the industry. Warrants and Representations
            <br/><br/>
            11.  The Vendor warrants and represents that it is the copyright holder of the Software. The Vendorwarrants and represents that granting the license to use this Software is not in violation of any otheragreement, copyright or applicable statute.Acceptance
            <br/><br/>
            12.  All terms, conditions and obligations of this Agreement will be deemed to be accepted by theLicensee (“Acceptance”) on registration of the Software with the Vendor.User Support
            <br/><br/>
            13.  No user support or maintenance is provided as part of this Agreement.Term
            <br/><br/>
            14.  The term of this Agreement will begin on Acceptance and is perpetual.Termination
            <br/><br/>
            15.  This Agreement will be terminated and the License forfeited where the Licensee has failed to complywith any of the terms of this Agreement or is in breach of this Agreement. On termination of this Agreement for any reason, the Licensee will promptly destroy the Software or return the Software tot he Vendor.Force Majeure
            <br/><br/>
            16.  The Vendor will be free of liability to the Licensee where the Vendor is prevented from executing itsobligations under this Agreement in whole or in part due to Force Majeure, such as earthquake, flood,
            fire or any other unforeseen and uncontrollable event where the Vendor has taken any and allappropriate action to mitigate such an event.Additional Clause
            <br/><br/>
            17.  Additional clause 1
            <br/><br/>
            18.  Additional clause 2Governing Law
            <br/><br/>
            19.  The Parties to this Agreement submit to the jurisdiction of the courts of the Province of Ontario forthe enforcement of this Agreement or any arbitration award or decision arising from this Agreement.This Agreement will be enforced or construed according to the laws of the Province of Ontario.Miscellaneous
            <br/><br/>
            20.  This Agreement can only be modified in writing signed by both the Vendor and the Licensee.
            <br/><br/>
            21.  This Agreement does not create or imply any relationship in agency or partnership between theVendor and the Licensee.
            <br/><br/>
            22.  Headings are inserted for the convenience of the parties only and are not to be considered wheninterpreting this Agreement. Words in the singular mean and include plural and vice versa. Words inthe masculine gender include the feminine gender and vice versa. Words in the neuter gender includethe masculine gender and the feminine gender and vice versa.
            <br/><br/>
            23.  If any term, covenant, condition or provision of this Agreement is held by a court of competentjurisdiction to be invalid, void or unenforceable, it is the parties’ intent that such provision be reducedin scope by the court only to the extent deemed necessary by that court to render the provisionreasonable and enforceable and the remainder of the provisions of this Agreement will in no way beaffected, impaired or invalidated as a result.
            <br/><br/>
            24.  This Agreement contains the entire agreement between the parties. All understandings have beenincluded in this Agreement. Representations which may have been made by any party to thisAgreement may in some way be inconsistent with this final written Agreement. All such statementsare declared to be of no value in this Agreement. Only the written terms of this Agreement will bindthe parties.
            <br/><br/>
            25.  This Agreement and the terms and conditions contained in this Agreement apply to and are bindingupon the Vendor’s successors and assigns.Privacy Policy
            <br/><br/>
            26.  AvocadoCore receives authorization and consent from Users to collect, process and otherwise handlepersonal Information under this Privacy Policy when the user: (a) purchases the services; (b)establishes an account or registers to use the services; (c) accesses the services through accountcredentials that an educator has associated with the user’s personal information, such as through aninstitution’s course or learning management system; or (d) uses the Services.
            <br/><br/>
            27.  AvocadoCore collects and processes account data to set up, maintain and enable a user account to usethe services. Account data includes a user’s first and last name, student number, email address, username and password, the institution and course identifier for any courses for which user uses theservices, as well as data that helps develop and maintain AI processing technology.
            <br/><br/>
            28.  Course data means educational data collected, generated or processed through use of the services inconnection with educational coursework. Course data includes assignments, student coursework,responses to interactive exercises, assignments and tests, scores, grades and instructor comments.AvocadoCore collects and processes course data in order to provide the services to users, educatorsand institutions for educational purposes.
            <br/><br/>
            29.  Course data is utilized in the training and use of Artificial Intelligence. This data collected includesquestions, response to questions, marks of assignments and tests, mark of questions, mark of sets andresponse to teaching tools. AvocadoCore uses this data to train and test AvocadoCore’s ArtificialIntelligence system, To produce questions and tests for a student account based off of data collectedand to give feedback to teachers based off of data collected.
            <br/><br/>
            30.  To protect personal Information, users, educators and institutions are urged to: (a) protect and nevershare their passwords; (b) only access the services using secure networks; (c) maintain updatedinternet security and virus protection software on their devices and computer systems; (d)immediately change a password and contact AvocadoCore support if there is a suspicion that thepassword has been compromised; and (e) contact AvocadoCore support if there is another security orprivacy concern or issue.
            </p>
        );
    };
};