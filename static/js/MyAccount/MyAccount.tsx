import React, {PureComponent, ChangeEvent} from 'react';
import {
    Avatar,
    FormControlLabel,
    Paper,
    Radio,
    RadioGroup,
    Typography,
    Grid,
    TextField,
    MenuItem,
    Button,
} from '@material-ui/core';
import * as Http from '../Http';
import {colorList} from '../SharedComponents/AVOCustomColors';
import {ShowSnackBar} from '../Layout/Layout';
import {User} from 'App';

export interface MyAccountProps {
    setColor: (color: number) => () => void;
    setTheme: (theme: 'light' | 'dark') => () => void;
    color: number;
    theme: 'light' | 'dark';
    showSnackBar: ShowSnackBar;
    updateUser: (result: Http.GetUserInfo) => void;
    user: User;
}

interface MyAccountState {
    firstName: string;
    lastName: string;
    isTeacher: boolean;
    isAdmin: boolean;
    color: number;
    theme: 'dark' | 'light';
    country: string;
    language: string;
    description: string;
    displayName: string;
    socials: string[];
}

export default class MyAccount extends React.Component<MyAccountProps, MyAccountState> {
    constructor(props: MyAccountProps) {
        super(props);
        this.state = {
            firstName: '',
            lastName: '',
            isTeacher: false,
            isAdmin: false,
            color: 0,
            theme: 'light',
            country: '',
            language: '',
            description: '',
            displayName: '',
            socials: [],
        };
    }

    componentDidMount = () => {
        this.setState(this.props.user);
    };

    personalInfoChanged = () => {
        const {user} = this.props;
        return (
            this.state.firstName !== user.firstName ||
            this.state.lastName !== user.lastName ||
            this.state.displayName !== user.displayName ||
            this.state.description !== user.description
        );
    };

    regionalInfoChanged = () => {
        const {user} = this.props;
        return this.state.country !== user.country || this.state.language !== user.language;
    };

    savePersonalInfo = () => {
        let nameSave: boolean = true;
        let displayNameSave: boolean = true;
        let descriptionSave: boolean = true;
        const {user} = this.props;
        if (this.state.firstName !== user.firstName || this.state.lastName !== user.lastName) {
            Http.changeName(
                this.state.firstName,
                this.state.lastName,
                () => {},
                () => {
                    nameSave = false;
                },
            );
        }
        if (this.state.displayName !== user.displayName) {
            Http.changeDisplayName(
                this.state.displayName,
                () => {},
                () => {
                    displayNameSave = false;
                },
            );
        }
        if (this.state.description !== user.description) {
            Http.changeDescription(
                this.state.description,
                () => {},
                () => {
                    descriptionSave = false;
                },
            );
        }
        if (nameSave && displayNameSave && descriptionSave) {
            this.props.updateUser({
                ...user,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                displayName: this.state.displayName,
                description: this.state.description,
                theme: user.theme === 'dark',
            });
            this.props.showSnackBar('success', 'Personal info updated', 1500);
        } else {
            this.props.showSnackBar('error', 'Personal info could not be updated', 1500);
        }
    };

    saveRegionalInfo = () => {
        let countrySave = true;
        let languageSave = true;
        const {user} = this.props;
        if (this.state.country !== user.country) {
            Http.changeCountry(
                this.state.country,
                () => {},
                () => {
                    countrySave = false;
                },
            );
        }
        if (this.state.language !== user.language) {
            Http.changeLanguage(
                this.state.language,
                () => {},
                () => {
                    languageSave = false;
                },
            );
        }
        if (countrySave && languageSave) {
            this.props.updateUser({
                ...user,
                country: this.state.country,
                language: this.state.language,
                theme: user.theme === 'dark',
            });
            this.props.showSnackBar('success', 'Regional info updated', 1500);
        } else {
            this.props.showSnackBar('error', 'Regional info could not be updated', 1500);
        }
    };

    render() {
        const user = this.state;
        return (
            <Paper style={{margin: '20px 15%', padding: '10px', flex: 1, overflowY: 'auto'}}>
                <Grid container>
                    <Grid item xs={12} xl={6}>
                        <Typography variant='h5'>Please select a color</Typography>
                        <table>
                            <tbody>
                                <tr>{colorList.slice(0, 6).map((x, y) => this.colorIcon(x, y))}</tr>
                                <tr>
                                    {colorList.slice(6, 12).map((x, y) => this.colorIcon(x, y + 6))}
                                </tr>
                                <tr>
                                    {colorList
                                        .slice(12, 18)
                                        .map((x, y) => this.colorIcon(x, y + 12))}
                                </tr>
                            </tbody>
                        </table>
                    </Grid>
                    <Grid item xs={12} xl={6}>
                        <Typography variant='h5'>Please select a theme</Typography>
                        <RadioGroup
                            name='theme'
                            value={this.props.theme}
                            onChange={(e, value) => this.changeTheme(value as 'light' | 'dark')}
                        >
                            <FormControlLabel
                                value='light'
                                control={<Radio color='primary' />}
                                label='Light Theme'
                            />
                            <FormControlLabel
                                value='dark'
                                control={<Radio color='primary' />}
                                label='Dark Theme'
                            />
                        </RadioGroup>
                    </Grid>
                    <Typography>To delete account please email: contact@avocadocore.com</Typography>
                </Grid>
                <Typography variant='h5' style={{margin: '10px 0 5px'}}>
                    Personal Information
                </Typography>
                <Grid container spacing={2}>
                    <Grid item container direction='column' xs={12} md={6} justify='space-between'>
                        <Grid item container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    id='first-name-input'
                                    label='First Name'
                                    value={user.firstName}
                                    onChange={(
                                        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
                                    ) => this.setState({firstName: event.target.value})}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    id='last-name-input'
                                    label='Last Name'
                                    variant='outlined'
                                    value={user.lastName}
                                    onChange={(
                                        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
                                    ) => this.setState({lastName: event.target.value})}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                        <Grid item>
                            <TextField
                                id='nickname-input'
                                label='Nickname'
                                variant='outlined'
                                value={user.displayName}
                                onChange={(
                                    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
                                ) => this.setState({displayName: event.target.value})}
                                fullWidth
                                style={{marginTop: '10px'}}
                            />
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            id='description-input'
                            label='Description'
                            multiline
                            variant='outlined'
                            value={user.description}
                            onChange={(
                                event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
                            ) => this.setState({description: event.target.value})}
                            fullWidth
                            rows={5}
                            rowsMax={5}
                        />
                    </Grid>
                    <Button
                        variant='contained'
                        color='primary'
                        style={{marginLeft: '8px'}}
                        onClick={this.savePersonalInfo}
                        disabled={!this.personalInfoChanged()}
                    >
                        Save
                    </Button>
                </Grid>
                <Typography variant='h5' style={{margin: '10px 0 5px'}}>
                    Region
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            id='country-input'
                            label='Country'
                            variant='outlined'
                            value={user.country}
                            onChange={(
                                event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
                            ) => this.setState({country: event.target.value})}
                            fullWidth
                            select
                        >
                            {countries.map(country => (
                                <MenuItem key={country.code} value={country.code}>
                                    {country.value}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            id='language-input'
                            label='Language'
                            variant='outlined'
                            value={user.language}
                            onChange={(
                                event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
                            ) => this.setState({language: event.target.value})}
                            fullWidth
                            select
                        >
                            {languages.map(language => (
                                <MenuItem key={language.code} value={language.code}>
                                    {language.value}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Button
                        variant='contained'
                        color='primary'
                        style={{marginLeft: '8px'}}
                        onClick={this.saveRegionalInfo}
                        disabled={!this.regionalInfoChanged()}
                    >
                        Save
                    </Button>
                </Grid>
            </Paper>
        );
    }

    colorIcon(color: {'500': string}, index: number) {
        return (
            <td style={{padding: '10px'}} key={'selectColor' + index}>
                <Avatar
                    style={{width: '60px', height: '60px', backgroundColor: color['500']}}
                    onClick={() => this.changeColor(index)}
                />
            </td>
        );
    }

    changeColor = (color: number) => {
        Http.changeColor(color, this.props.setColor(color), this.onError);
    };

    changeTheme = (theme: 'light' | 'dark') => {
        Http.changeTheme(theme === 'dark' ? 1 : 0, this.props.setTheme(theme), this.onError);
    };

    onError = () => this.props.showSnackBar('error', 'An error occurred', 2000);
}

const countries = [
    {code: 'ABW', value: 'Aruba'},
    {code: 'AFG', value: 'Afghanistan'},
    {code: 'AGO', value: 'Angola'},
    {code: 'AIA', value: 'Anguilla'},
    {code: 'ALA', value: 'Åland Islands'},
    {code: 'ALB', value: 'Albania'},
    {code: 'AND', value: 'Andorra'},
    {code: 'ARE', value: 'United Arab Emirates'},
    {code: 'ARG', value: 'Argentina'},
    {code: 'ARM', value: 'Armenia'},
    {code: 'ASM', value: 'American Samoa'},
    {code: 'ATA', value: 'Antarctica'},
    {code: 'ATF', value: 'French Southern Territories'},
    {code: 'ATG', value: 'Antigua and Barbuda'},
    {code: 'AUS', value: 'Australia'},
    {code: 'AUT', value: 'Austria'},
    {code: 'AZE', value: 'Azerbaijan'},
    {code: 'BDI', value: 'Burundi'},
    {code: 'BEL', value: 'Belgium'},
    {code: 'BEN', value: 'Benin'},
    {code: 'BES', value: 'Bonaire, Sint Eustatius and Saba'},
    {code: 'BFA', value: 'Burkina Faso'},
    {code: 'BGD', value: 'Bangladesh'},
    {code: 'BGR', value: 'Bulgaria'},
    {code: 'BHR', value: 'Bahrain'},
    {code: 'BHS', value: 'Bahamas'},
    {code: 'BIH', value: 'Bosnia and Herzegovina'},
    {code: 'BLM', value: 'Saint Barthélemy'},
    {code: 'BLR', value: 'Belarus'},
    {code: 'BLZ', value: 'Belize'},
    {code: 'BMU', value: 'Bermuda'},
    {code: 'BOL', value: 'Bolivia (Plurinational State of)'},
    {code: 'BRA', value: 'Brazil'},
    {code: 'BRB', value: 'Barbados'},
    {code: 'BRN', value: 'Brunei Darussalam'},
    {code: 'BTN', value: 'Bhutan'},
    {code: 'BVT', value: 'Bouvet Island'},
    {code: 'BWA', value: 'Botswana'},
    {code: 'CAF', value: 'Central African Republic'},
    {code: 'CAN', value: 'Canada'},
    {code: 'CCK', value: 'Cocos (Keeling) Islands'},
    {code: 'CHE', value: 'Switzerland'},
    {code: 'CHL', value: 'Chile'},
    {code: 'CHN', value: 'China'},
    {code: 'CIV', value: "Côte d'Ivoire"},
    {code: 'CMR', value: 'Cameroon'},
    {code: 'COD', value: 'Congo, Democratic Republic of the'},
    {code: 'COG', value: 'Congo'},
    {code: 'COK', value: 'Cook Islands'},
    {code: 'COL', value: 'Colombia'},
    {code: 'COM', value: 'Comoros'},
    {code: 'CPV', value: 'Cabo Verde'},
    {code: 'CRI', value: 'Costa Rica'},
    {code: 'CUB', value: 'Cuba'},
    {code: 'CUW', value: 'Curaçao'},
    {code: 'CXR', value: 'Christmas Island'},
    {code: 'CYM', value: 'Cayman Islands'},
    {code: 'CYP', value: 'Cyprus'},
    {code: 'CZE', value: 'Czechia'},
    {code: 'DEU', value: 'Germany'},
    {code: 'DJI', value: 'Djibouti'},
    {code: 'DMA', value: 'Dominica'},
    {code: 'DNK', value: 'Denmark'},
    {code: 'DOM', value: 'Dominican Republic'},
    {code: 'DZA', value: 'Algeria'},
    {code: 'ECU', value: 'Ecuador'},
    {code: 'EGY', value: 'Egypt'},
    {code: 'ERI', value: 'Eritrea'},
    {code: 'ESH', value: 'Western Sahara'},
    {code: 'ESP', value: 'Spain'},
    {code: 'EST', value: 'Estonia'},
    {code: 'ETH', value: 'Ethiopia'},
    {code: 'FIN', value: 'Finland'},
    {code: 'FJI', value: 'Fiji'},
    {code: 'FLK', value: 'Falkland Islands (Malvinas)'},
    {code: 'FRA', value: 'France'},
    {code: 'FRO', value: 'Faroe Islands'},
    {code: 'FSM', value: 'Micronesia (Federated States of)'},
    {code: 'GAB', value: 'Gabon'},
    {code: 'GBR', value: 'United Kingdom of Great Britain and Northern Ireland'},
    {code: 'GEO', value: 'Georgia'},
    {code: 'GGY', value: 'Guernsey'},
    {code: 'GHA', value: 'Ghana'},
    {code: 'GIB', value: 'Gibraltar'},
    {code: 'GIN', value: 'Guinea'},
    {code: 'GLP', value: 'Guadeloupe'},
    {code: 'GMB', value: 'Gambia'},
    {code: 'GNB', value: 'Guinea-Bissau'},
    {code: 'GNQ', value: 'Equatorial Guinea'},
    {code: 'GRC', value: 'Greece'},
    {code: 'GRD', value: 'Grenada'},
    {code: 'GRL', value: 'Greenland'},
    {code: 'GTM', value: 'Guatemala'},
    {code: 'GUF', value: 'French Guiana'},
    {code: 'GUM', value: 'Guam'},
    {code: 'GUY', value: 'Guyana'},
    {code: 'HKG', value: 'Hong Kong'},
    {code: 'HMD', value: 'Heard Island and McDonald Islands'},
    {code: 'HND', value: 'Honduras'},
    {code: 'HRV', value: 'Croatia'},
    {code: 'HTI', value: 'Haiti'},
    {code: 'HUN', value: 'Hungary'},
    {code: 'IDN', value: 'Indonesia'},
    {code: 'IMN', value: 'Isle of Man'},
    {code: 'IND', value: 'India'},
    {code: 'IOT', value: 'British Indian Ocean Territory'},
    {code: 'IRL', value: 'Ireland'},
    {code: 'IRN', value: 'Iran (Islamic Republic of)'},
    {code: 'IRQ', value: 'Iraq'},
    {code: 'ISL', value: 'Iceland'},
    {code: 'ISR', value: 'Israel'},
    {code: 'ITA', value: 'Italy'},
    {code: 'JAM', value: 'Jamaica'},
    {code: 'JEY', value: 'Jersey'},
    {code: 'JOR', value: 'Jordan'},
    {code: 'JPN', value: 'Japan'},
    {code: 'KAZ', value: 'Kazakhstan'},
    {code: 'KEN', value: 'Kenya'},
    {code: 'KGZ', value: 'Kyrgyzstan'},
    {code: 'KHM', value: 'Cambodia'},
    {code: 'KIR', value: 'Kiribati'},
    {code: 'KNA', value: 'Saint Kitts and Nevis'},
    {code: 'KOR', value: 'Korea, Republic of'},
    {code: 'KWT', value: 'Kuwait'},
    {code: 'LAO', value: "Lao People's Democratic Republic"},
    {code: 'LBN', value: 'Lebanon'},
    {code: 'LBR', value: 'Liberia'},
    {code: 'LBY', value: 'Libya'},
    {code: 'LCA', value: 'Saint Lucia'},
    {code: 'LIE', value: 'Liechtenstein'},
    {code: 'LKA', value: 'Sri Lanka'},
    {code: 'LSO', value: 'Lesotho'},
    {code: 'LTU', value: 'Lithuania'},
    {code: 'LUX', value: 'Luxembourg'},
    {code: 'LVA', value: 'Latvia'},
    {code: 'MAC', value: 'Macao'},
    {code: 'MAF', value: 'Saint Martin (French part)'},
    {code: 'MAR', value: 'Morocco'},
    {code: 'MCO', value: 'Monaco'},
    {code: 'MDA', value: 'Moldova, Republic of'},
    {code: 'MDG', value: 'Madagascar'},
    {code: 'MDV', value: 'Maldives'},
    {code: 'MEX', value: 'Mexico'},
    {code: 'MHL', value: 'Marshall Islands'},
    {code: 'MKD', value: 'North Macedonia'},
    {code: 'MLI', value: 'Mali'},
    {code: 'MLT', value: 'Malta'},
    {code: 'MMR', value: 'Myanmar'},
    {code: 'MNE', value: 'Montenegro'},
    {code: 'MNG', value: 'Mongolia'},
    {code: 'MNP', value: 'Northern Mariana Islands'},
    {code: 'MOZ', value: 'Mozambique'},
    {code: 'MRT', value: 'Mauritania'},
    {code: 'MSR', value: 'Montserrat'},
    {code: 'MTQ', value: 'Martinique'},
    {code: 'MUS', value: 'Mauritius'},
    {code: 'MWI', value: 'Malawi'},
    {code: 'MYS', value: 'Malaysia'},
    {code: 'MYT', value: 'Mayotte'},
    {code: 'NAM', value: 'Namibia'},
    {code: 'NCL', value: 'New Caledonia'},
    {code: 'NER', value: 'Niger'},
    {code: 'NFK', value: 'Norfolk Island'},
    {code: 'NGA', value: 'Nigeria'},
    {code: 'NIC', value: 'Nicaragua'},
    {code: 'NIU', value: 'Niue'},
    {code: 'NLD', value: 'Netherlands'},
    {code: 'NOR', value: 'Norway'},
    {code: 'NPL', value: 'Nepal'},
    {code: 'NRU', value: 'Nauru'},
    {code: 'NZL', value: 'New Zealand'},
    {code: 'OMN', value: 'Oman'},
    {code: 'PAK', value: 'Pakistan'},
    {code: 'PAN', value: 'Panama'},
    {code: 'PCN', value: 'Pitcairn'},
    {code: 'PER', value: 'Peru'},
    {code: 'PHL', value: 'Philippines'},
    {code: 'PLW', value: 'Palau'},
    {code: 'PNG', value: 'Papua New Guinea'},
    {code: 'POL', value: 'Poland'},
    {code: 'PRI', value: 'Puerto Rico'},
    {code: 'PRK', value: "Korea (Democratic People's Republic of)"},
    {code: 'PRT', value: 'Portugal'},
    {code: 'PRY', value: 'Paraguay'},
    {code: 'PSE', value: 'Palestine, State of'},
    {code: 'PYF', value: 'French Polynesia'},
    {code: 'QAT', value: 'Qatar'},
    {code: 'REU', value: 'Réunion'},
    {code: 'ROU', value: 'Romania'},
    {code: 'RUS', value: 'Russian Federation'},
    {code: 'RWA', value: 'Rwanda'},
    {code: 'SAU', value: 'Saudi Arabia'},
    {code: 'SDN', value: 'Sudan'},
    {code: 'SEN', value: 'Senegal'},
    {code: 'SGP', value: 'Singapore'},
    {code: 'SGS', value: 'South Georgia and the South Sandwich Islands'},
    {code: 'SHN', value: 'Saint Helena, Ascension and Tristan da Cunha'},
    {code: 'SJM', value: 'Svalbard and Jan Mayen'},
    {code: 'SLB', value: 'Solomon Islands'},
    {code: 'SLE', value: 'Sierra Leone'},
    {code: 'SLV', value: 'El Salvador'},
    {code: 'SMR', value: 'San Marino'},
    {code: 'SOM', value: 'Somalia'},
    {code: 'SPM', value: 'Saint Pierre and Miquelon'},
    {code: 'SRB', value: 'Serbia'},
    {code: 'SSD', value: 'South Sudan'},
    {code: 'STP', value: 'Sao Tome and Principe'},
    {code: 'SUR', value: 'Suriname'},
    {code: 'SVK', value: 'Slovakia'},
    {code: 'SVN', value: 'Slovenia'},
    {code: 'SWE', value: 'Sweden'},
    {code: 'SWZ', value: 'Eswatini'},
    {code: 'SXM', value: 'Sint Maarten (Dutch part)'},
    {code: 'SYC', value: 'Seychelles'},
    {code: 'SYR', value: 'Syrian Arab Republic'},
    {code: 'TCA', value: 'Turks and Caicos Islands'},
    {code: 'TCD', value: 'Chad'},
    {code: 'TGO', value: 'Togo'},
    {code: 'THA', value: 'Thailand'},
    {code: 'TJK', value: 'Tajikistan'},
    {code: 'TKL', value: 'Tokelau'},
    {code: 'TKM', value: 'Turkmenistan'},
    {code: 'TLS', value: 'Timor-Leste'},
    {code: 'TON', value: 'Tonga'},
    {code: 'TTO', value: 'Trinidad and Tobago'},
    {code: 'TUN', value: 'Tunisia'},
    {code: 'TUR', value: 'Turkey'},
    {code: 'TUV', value: 'Tuvalu'},
    {code: 'TWN', value: 'Taiwan, Province of China'},
    {code: 'TZA', value: 'Tanzania, United Republic of'},
    {code: 'UGA', value: 'Uganda'},
    {code: 'UKR', value: 'Ukraine'},
    {code: 'UMI', value: 'United States Minor Outlying Islands'},
    {code: 'URY', value: 'Uruguay'},
    {code: 'USA', value: 'United States of America'},
    {code: 'UZB', value: 'Uzbekistan'},
    {code: 'VAT', value: 'Holy See'},
    {code: 'VCT', value: 'Saint Vincent and the Grenadines'},
    {code: 'VEN', value: 'Venezuela (Bolivarian Republic of)'},
    {code: 'VGB', value: 'Virgin Islands (British)'},
    {code: 'VIR', value: 'Virgin Islands (U.S.)'},
    {code: 'VNM', value: 'Viet Nam'},
    {code: 'VUT', value: 'Vanuatu'},
    {code: 'WLF', value: 'Wallis and Futuna'},
    {code: 'WSM', value: 'Samoa'},
    {code: 'YEM', value: 'Yemen'},
    {code: 'ZAF', value: 'South Africa'},
    {code: 'ZMB', value: 'Zambia'},
    {code: 'ZWE', value: 'Zimbabwe'},
];

const languages = [
    {code: 'AB', value: 'Abkhazian'},
    {code: 'AA', value: 'Afar'},
    {code: 'AF', value: 'Afrikaans'},
    {code: 'SQ', value: 'Albanian'},
    {code: 'AM', value: 'Amharic'},
    {code: 'AR', value: 'Arabic'},
    {code: 'HY', value: 'Armenian'},
    {code: 'AS', value: 'Assamese'},
    {code: 'AY', value: 'Aymara'},
    {code: 'AZ', value: 'Azerbaijani'},
    {code: 'BA', value: 'Bashkir'},
    {code: 'EU', value: 'Basque'},
    {code: 'BN', value: 'Bengali/Bangla'},
    {code: 'DZ', value: 'Bhutani'},
    {code: 'BH', value: 'Bihari'},
    {code: 'BI', value: 'Bislama'},
    {code: 'BR', value: 'Breton'},
    {code: 'BG', value: 'Bulgarian'},
    {code: 'MY', value: 'Burmese'},
    {code: 'BE', value: 'Byelorussian'},
    {code: 'KM', value: 'Cambodian'},
    {code: 'CA', value: 'Catalan'},
    {code: 'ZH', value: 'Chinese'},
    {code: 'CO', value: 'Corsican'},
    {code: 'HR', value: 'Croatian'},
    {code: 'CS', value: 'Czech'},
    {code: 'DA', value: 'Danish'},
    {code: 'NL', value: 'Dutch'},
    {code: 'EN', value: 'English'},
    {code: 'EO', value: 'Esperanto'},
    {code: 'ET', value: 'Estonian'},
    {code: 'FO', value: 'Faeroese'},
    {code: 'FJ', value: 'Fiji'},
    {code: 'FI', value: 'Finnish'},
    {code: 'FR', value: 'French'},
    {code: 'FY', value: 'Frisian'},
    {code: 'GD', value: 'Gaelic (Scots Gaelic)'},
    {code: 'GL', value: 'Galician'},
    {code: 'KA', value: 'Georgian'},
    {code: 'DE', value: 'German'},
    {code: 'EL', value: 'Greek'},
    {code: 'KL', value: 'Greenlandic'},
    {code: 'GN', value: 'Guarani'},
    {code: 'GU', value: 'Gujarati'},
    {code: 'HA', value: 'Hausa'},
    {code: 'IW', value: 'Hebrew'},
    {code: 'HI', value: 'Hindi'},
    {code: 'HU', value: 'Hungarian'},
    {code: 'IS', value: 'Icelandic'},
    {code: 'IN', value: 'Indonesian'},
    {code: 'IA', value: 'Interlingua'},
    {code: 'IE', value: 'Interlingue'},
    {code: 'IK', value: 'Inupiak'},
    {code: 'GA', value: 'Irish'},
    {code: 'IT', value: 'Italian'},
    {code: 'JA', value: 'Japanese'},
    {code: 'JW', value: 'Javanese'},
    {code: 'KN', value: 'Kannada'},
    {code: 'KS', value: 'Kashmiri'},
    {code: 'KK', value: 'Kazakh'},
    {code: 'RW', value: 'Kinyarwanda'},
    {code: 'KY', value: 'Kirghiz'},
    {code: 'RN', value: 'Kirundi'},
    {code: 'KO', value: 'Korean'},
    {code: 'KU', value: 'Kurdish'},
    {code: 'LO', value: 'Laothian'},
    {code: 'LA', value: 'Latin'},
    {code: 'LV', value: 'Latvian/Lettish'},
    {code: 'LN', value: 'Lingala'},
    {code: 'LT', value: 'Lithuanian'},
    {code: 'MK', value: 'Macedonian'},
    {code: 'MG', value: 'Malagasy'},
    {code: 'MS', value: 'Malay'},
    {code: 'ML', value: 'Malayalam'},
    {code: 'MT', value: 'Maltese'},
    {code: 'MI', value: 'Maori'},
    {code: 'MR', value: 'Marathi'},
    {code: 'MO', value: 'Moldavian'},
    {code: 'MN', value: 'Mongolian'},
    {code: 'NA', value: 'Nauru'},
    {code: 'NE', value: 'Nepali'},
    {code: 'NO', value: 'Norwegian'},
    {code: 'OC', value: 'Occitan'},
    {code: 'OR', value: 'Oriya'},
    {code: 'OM', value: 'Oromo/Afan'},
    {code: 'PS', value: 'Pashto/Pushto'},
    {code: 'FA', value: 'Persian'},
    {code: 'PL', value: 'Polish'},
    {code: 'PT', value: 'Portuguese'},
    {code: 'PA', value: 'Punjabi'},
    {code: 'QU', value: 'Quechua'},
    {code: 'RM', value: 'Rhaeto-Romance'},
    {code: 'RO', value: 'Romanian'},
    {code: 'RU', value: 'Russian'},
    {code: 'SM', value: 'Samoan'},
    {code: 'SG', value: 'Sangro'},
    {code: 'SA', value: 'Sanskrit'},
    {code: 'SR', value: 'Serbian'},
    {code: 'SH', value: 'Serbo-Croatian'},
    {code: 'ST', value: 'Sesotho'},
    {code: 'TN', value: 'Setswana'},
    {code: 'SN', value: 'Shona'},
    {code: 'SD', value: 'Sindhi'},
    {code: 'SI', value: 'Singhalese'},
    {code: 'SS', value: 'Siswati'},
    {code: 'SK', value: 'Slovak'},
    {code: 'SL', value: 'Slovenian'},
    {code: 'SO', value: 'Somali'},
    {code: 'ES', value: 'Spanish'},
    {code: 'SU', value: 'Sudanese'},
    {code: 'SW', value: 'Swahili'},
    {code: 'SV', value: 'Swedish'},
    {code: 'TL', value: 'Tagalog'},
    {code: 'TG', value: 'Tajik'},
    {code: 'TA', value: 'Tamil'},
    {code: 'TT', value: 'Tatar'},
    {code: 'TE', value: 'Tegulu'},
    {code: 'TH', value: 'Thai'},
    {code: 'BO', value: 'Tibetan'},
    {code: 'TI', value: 'Tigrinya'},
    {code: 'TO', value: 'Tonga'},
    {code: 'TS', value: 'Tsonga'},
    {code: 'TR', value: 'Turkish'},
    {code: 'TK', value: 'Turkmen'},
    {code: 'TW', value: 'Twi'},
    {code: 'UK', value: 'Ukrainian'},
    {code: 'UR', value: 'Urdu'},
    {code: 'UZ', value: 'Uzbek'},
    {code: 'VI', value: 'Vietnamese'},
    {code: 'VO', value: 'Volapuk'},
    {code: 'CY', value: 'Welsh'},
    {code: 'WO', value: 'Wolof'},
    {code: 'XH', value: 'Xhosa'},
    {code: 'JI', value: 'Yiddish'},
    {code: 'YO', value: 'Yoruba'},
    {code: 'ZU', value: 'Zulu'},
];
