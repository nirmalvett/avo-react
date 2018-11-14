# noinspection PyUnresolvedReferences
from os.path import abspath, dirname, join
from git import Repo


_cwd = dirname(abspath(__file__))

repo = Repo(".")
branch = repo.active_branch
branch = branch.name

# noinspection SpellCheckingInspection
SECRET_KEY = \
    'f%GXzNNjp?+Cy#SjC^v#&b=GApRPsvtjhAB*XF4AE@@rskTq3-@mHGcR%tWPe6EQZU$VrD6aU3zTYR4eAVb&wxYXsM3^dE!KWQ23a!9EUyeBZU9N' \
    'zQ_?2fnjT=M3*x?FH5vZx+9eXEE!J84RhDEQQMnYRJ=79sw8zVR?uXH5&fS8p=x*!qF#G@phb9A%4yy_zBNSTqd#RVLJx2S@C$^QxMw8bh_KaphT' \
    'qsGHhX9PRa8#j@Wh2X#H8?5PpDUW7y!*Ua24b@Ry6w3Uu%@a&2XASnh%vpzdnKV3PVQ-guuxN2m5useadac9$K6uuwLXranS8p5a_EDz+J*b?acY' \
    'g2pGGSQ8c2mjDw-P@hr$3PJXz_Ha*C=WaPuE26FG9cW!Z9s4-#k2TPS^NJ^MfYzYVggV@3KSdS8kFhhqs6Cewe%Rj%BZ6QgNV!y@kKqGYt6*tL5q' \
    'D=btZdtfU#ch-JCxSM649m+F+gQQJGtC%8nQZvKW3qPA*kPn+QJNDWnzVt62KC*b'
# noinspection SpellCheckingInspection
SECURITY_PASSWORD_SALT = \
    'X7%?c-zjB-=cM-yYRuTL4Q3htp7MyhJv*mC+Z9K*!_*xPrNMd3$G=DPYAtcNP#Kqv9h4?!dCRL237zgMgZKHq9BX=pC9UE@6usa5vFymwWmexjvg' \
    'ydVy767R%45g%HaAB?drE^DHdK_=n==?V*%D^W#&nzZ!RWDQxHK%?fCh2=?_=MH!EDftD#v+rcHJy-23wXFfJMt^P=eYt!YzwY%kNQb*j5FW6m5v' \
    'MH-YZppTQZwpHvu5*&+7dRc@6wcfX&BY?r$bUa&Z46rDH7mj+cLmLQ%HDnphK*DM8bNfwb5q@_Mhz^jp8@P%SkrLD%t2^W$DYug5*2avHA=hgXy%' \
    'vV#nQ=L@STf#fjg#HykW9Lc4R^p?JWsaqUyTx!ZEPMV_&BQT^##Wf!eH#PAAszk=JDy%uePhg9wdFSLmD%5Bd_FHHh8dDBpVSxNyuTtgj-$2YsNC' \
    'U?hKX?4hmH@KJ@?BeLW2kkHcNjJ3ZCC-vCUcYp2%DN8B*N5=Dxbc=?CuDvSQ7LSwXLwAtERXL7+dc5Eu2g9ZApb6BhepQWAczxnN%xSPepfN=E!?' \
    'nwn+M*NVcXqNEbCfr9SLJYWWtTQb!ukdY6TAA9f#G^HD$!UUg=jnxhD3HZZ8LEcet8CqcjbQ*wKMhC6*Z#LQYMqWmvTtXdGzznHW$L-%W!+wmGJQ' \
    '@KsdurBJGr@anG5GdaR5ZgBk?EtBRShwcz?n46a!?zTVHC8#!seRW4xWwL^EB+5@?G#u2F?hW7zyh$b4^KEVpwsNgYSba$cwpTsXZ6Kz!MpH!E-h' \
    'G5XwF!xep2C@d8k5&Sv+kcx+&Mqy&QJADaax?cU8m@vy6mNVqAZT&y@=REDtep#h5eMU-WXDG++nJu9-RwbaU=288W9fUrTLMbB8*G=A6w-tgr%H' \
    'PQVVAj8swCr_D?w?Rys%JwSDJz!Gxrw^DZKvwM5ef=Zka-#zSXy_X?rwL5Me694yBA@SFXn#BcjLH*UG*WjgFe*Ya7-@aWCt?xdw=fAA8F=d+dRe' \
    '4Sk-+WGNdbdJW4X!'

# ===================================================================================================================
# Database URI location on server. One of these needs to be commented out.
# Running MySQL Locally, if you are not sure then this is the correct choice
# SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root@localhost/dev'

# For APP and DEV
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://avocado:uw%J@%$n5C15q8Xswv@localhost/' + branch
# ===================================================================================================================

SQLALCHEMY_ECHO = False
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Gzip Settings
COMPRESS_MIMETYPES = [
    'text/html',
    'text/css',
    'application/json',
    'application/javascript',
    'image/svg'
]
