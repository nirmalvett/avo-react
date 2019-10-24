import React, {ReactElement} from 'react';
import Typography from '@material-ui/core/Typography/Typography';

const s = {verticalAlign: 'top', padding: 16};

function H(props: {children: Children}) {
    return (
        <td style={s}>
            <Typography color='textPrimary' variant='subtitle1'>
                {props.children}
            </Typography>
        </td>
    );
}

type Children = string | ReactElement | (string | ReactElement)[];

function P(props: {children: Children}) {
    return (
        <td style={s}>
            <Typography color='textPrimary'>{props.children}</Typography>
        </td>
    );
}

export default (): ReactElement => (
    <div style={{margin: 20, flex: 1, overflowY: 'auto'}}>
        <Typography color='textPrimary' variant='h6'>
            Random Generator Functions
        </Typography>
        <table>
            <thead>
                <tr>
                    <H>Function</H>
                    <H>Description</H>
                    <H>Arguments</H>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <P>boolean()</P>
                    <P>Generates a random boolean value.</P>
                    <P>N/A</P>
                </tr>
                <tr>
                    <P>number(min, max, zeroes/mod)</P>
                    <P>Generates a random number.</P>
                    <P>
                        min: The minimum allowable value (inclusive)
                        <br />
                        max: The maximum allowable value (inclusive)
                        <br />
                        zeroes/mod: Set this to 0 to generate any random number in the range. Set it
                        to 1 to generate any nonzero number in the range. Set it to 2+ to generate a
                        number in that modulo base.
                    </P>
                </tr>
                <tr>
                    <P>Matrix(min, max, zeroes/mod=0, rows, cols=1)</P>
                    <P>Generates a matrix with random values.</P>
                    <P>
                        min: The minimum allowable value (inclusive)
                        <br />
                        max: The maximum allowable value (inclusive)
                        <br />
                        zeroes/mod: Set this to 0 to generate any random number in the range. Set it
                        to 1 to generate any nonzero number in the range. Set it to 2+ to generate a
                        number in that modulo base.
                        <br />
                        rows: The number of rows in the matrix.
                        <br />
                        cols: The number of columns in the matrix.
                    </P>
                </tr>
                <tr>
                    <P>code_vector(check_vector)</P>
                    <P>Generates a valid code vector</P>
                    <P>check_vector: The check vector for the generated code vector</P>
                </tr>
                <tr>
                    <P>
                        matrix_rank(dimension, rank, seed=-1, row=-1, column=-1, negative=-1,
                        transpose=-1)
                    </P>
                    <P>
                        This generates a matrix with a specified dimension and rank. It starts with
                        a matrix chosen from a list, and then applies transformations to it.
                    </P>
                    <P>
                        dimension: The side length of the matrix.
                        <br />
                        rank: The rank of the matrix.
                        <br />
                        seed: determines what matrix to start with. Leave it as -1 if unsure.
                        <br />
                        row: decides the order of the rows. Leave it as -1 if unsure.
                        <br />
                        column: decides the order of the columns. Leave it as -1 if unsure.
                        <br />
                        negative: decides which rows and columns to multiply by -1. Leave it as -1
                        if unsure.
                        <br />
                        transpose: decides whether to transpose the matrix. Leave it as -1 if
                        unsure.
                    </P>
                </tr>
                <tr>
                    <P>matrix_eigen(dimension, seed=-1, row=-1)</P>
                    <P>Generates a matrix with distinct eigenvalues and eigenvectors</P>
                    <P>
                        dimension: The number of rows/columns in the matrix.
                        <br />
                        seed: the random matrix to start with. Leave it as -1 if unsure.
                        <br />
                        row: the order that the rows and columns are arranged. Leave it as -1 if
                        unsure.
                    </P>
                </tr>
                <tr>
                    <P>
                        matrix_rank_mod5(dimension, rank, seed=-1, row=-1, column=-1, transpose=-1)
                    </P>
                    <P>
                        This generates a matrix in Z5 with a specified dimension and rank. It starts
                        with a matrix chosen from a list, and then applies transformations to it.
                    </P>
                    <P>
                        dimension: The side length of the matrix.
                        <br />
                        rank: The rank of the matrix.
                        <br />
                        seed: determines what matrix to start with. Leave it as -1 if unsure.
                        <br />
                        row: decides the order of the rows. Leave it as -1 if unsure.
                        <br />
                        column: decides the order of the columns. Leave it as -1 if unsure.
                        <br />
                        negative: decides which rows and columns to multiply by -1. Leave it as -1
                        if unsure.
                        <br />
                        transpose: decides whether to transpose the matrix. Leave it as -1 if
                        unsure.
                    </P>
                </tr>
                <tr>
                    <P>basis(size, seed=-1, row=-1, column=-1, negative=-1)</P>
                    <P>Generates an orthogonal basis.</P>
                    <P>
                        size: The size of the basis.
                        <br />
                        seed: determines what basis to start with. Leave it as -1 if unsure.
                        <br />
                        row: decides the order of the vectors. Leave it as -1 if unsure.
                        <br />
                        column: decides the order of the terms in each vector. Leave it as -1 if
                        unsure.
                        <br />
                        negative: decides which rows and columns to multiply by -1. Leave it as -1
                        if unsure.
                    </P>
                </tr>
            </tbody>
        </table>
        <Typography color='textPrimary' variant='h6'>
            Other Functions
        </Typography>
        <table>
            <thead>
                <tr>
                    <H>Function</H>
                    <H>Description</H>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <P>sqrt(n)</P>
                    <P>Calculates the square root of the number</P>
                </tr>
                <tr>
                    <P>sin(n)</P>
                    <P>Calculates the sine of the number</P>
                </tr>
                <tr>
                    <P>cos(n)</P>
                    <P>Calculates the cosine of the number</P>
                </tr>
                <tr>
                    <P>tan(n)</P>
                    <P>Calculates the tangent of the number</P>
                </tr>
                <tr>
                    <P>arcsin(n)</P>
                    <P>Calculates the inverse sine of the number</P>
                </tr>
                <tr>
                    <P>arccos(n)</P>
                    <P>Calculates the inverse cosine of the number</P>
                </tr>
                <tr>
                    <P>arctan(n)</P>
                    <P>Calculates the inverse tangent of the number</P>
                </tr>
                <tr>
                    <P>rot(n)</P>
                    <P>Finds the rotation matrix of the given angle</P>
                </tr>
                <tr>
                    <P>ref(n)</P>
                    <P>Finds the reflection matrix of the given angle</P>
                </tr>
                <tr>
                    <P>norm(v)</P>
                    <P>The length of the given vector</P>
                </tr>
                <tr>
                    <P>angle(u,v)</P>
                    <P>The angle between the two vectors</P>
                </tr>
                <tr>
                    <P>proj(u,v)</P>
                    <P>The projection of v onto u</P>
                </tr>
                <tr>
                    <P>get(m, row=0, col=0)</P>
                    <P>Gets the cell at the specified location of the matrix</P>
                </tr>
                <tr>
                    <P>set(m, row=0, col=0, n)</P>
                    <P>
                        Sets the cell at the specified location of the matrix with the specified
                        value
                    </P>
                </tr>
                <tr>
                    <P>adj(m)</P>
                    <P>Finds the adjoint of the matrix</P>
                </tr>
                <tr>
                    <P>det(m)</P>
                    <P>Calculates the determinant of the matrix</P>
                </tr>
                <tr>
                    <P>inverse(m)</P>
                    <P>Calculates the inverse of the matrix</P>
                </tr>
                <tr>
                    <P>rref(m)</P>
                    <P>Finds the reduced row echelon form of the matrix</P>
                </tr>
                <tr>
                    <P>row(m)</P>
                    <P>Finds the row space of the matrix</P>
                </tr>
                <tr>
                    <P>col(m)</P>
                    <P>Finds the column space of the matrix</P>
                </tr>
                <tr>
                    <P>null(m)</P>
                    <P>Finds the null space of the matrix</P>
                </tr>
                <tr>
                    <P>eigenspaces(m)</P>
                    <P>Finds the eigenvectors and eigenvalues of the matrix</P>
                </tr>
                <tr>
                    <P>diagonal(v)</P>
                    <P>Creates a matrix with the vector as the diagonal values</P>
                </tr>
                <tr>
                    <P>rank(m)</P>
                    <P>Finds the rank of the matrix</P>
                </tr>
                <tr>
                    <P>char_poly(m)</P>
                    <P>Computes the characteristic polynomial of the matrix</P>
                </tr>
                <tr>
                    <P>orthogonalize(b)</P>
                    <P>Uses the Gram-Schmidt process to orthogonalize the basis</P>
                </tr>
                <tr>
                    <P>pmatrix(b)</P>
                    <P>Finds the projection matrix for the basis</P>
                </tr>
                <tr>
                    <P>normalize(b)</P>
                    <P>Normalizes the basis</P>
                </tr>
                <tr>
                    <P>dim(b)</P>
                    <P>Finds the dimension of the basis</P>
                </tr>
            </tbody>
        </table>
        <Typography color='textPrimary' variant='h6'>
            Marking Functions
        </Typography>
        <table>
            <thead>
                <tr>
                    <H>Function</H>
                    <H>Usage</H>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <P>tf(student_answer, correct_answer)</P>
                    <P>
                        This function is used for marking true/false questions. For example, if you
                        wanted to give them marks for selecting "False" on part 4, you would set the
                        criteria as "tf(@4, False)".
                    </P>
                </tr>
                <tr>
                    <P>mc(student_answer, correct_answer)</P>
                    <P>
                        This function is used for marking multiple choice questions. For example, if
                        you wanted to give them marks for selecting the second answer on part 3, you
                        would set the criteria as "mc(@3, 2)".
                    </P>
                </tr>
            </tbody>
        </table>
        <Typography color='textPrimary' variant='h6'>
            Display Functions
        </Typography>
        <table>
            <thead>
                <tr>
                    <H>Function</H>
                    <H>Description</H>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <P>equations(m, v)</P>
                    <P>
                        This turns the matrix and vector into a system of equations. If every
                        equation equals zero, you can just put '0' instead of a vector.
                    </P>
                </tr>
                <tr>
                    <P>pivots(m)</P>
                    <P>This highlights the pivots in a matrix.</P>
                </tr>
                <tr>
                    <P>free_vars(v, b)</P>
                    <P>
                        This creates a vector with free variables. Each free variable is a vector in
                        the basis.
                    </P>
                </tr>
                <tr>
                    <P>point(v)</P>
                    <P>
                        This displays the vector as a coordinate rather than vertically in square
                        brackets. It is mostly useful for 1229 questions, or questions related to
                        lines and planes.
                    </P>
                </tr>
                <tr>
                    <P>augment(m, v)</P>
                    <P>This creates the augmented matrix [m|v].</P>
                </tr>
            </tbody>
        </table>
        <Typography color='textPrimary' variant='h6'>
            Operators
        </Typography>
        <table>
            <thead>
                <tr>
                    <H>Operator</H>
                    <H>Description</H>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <P>A or B</P>
                    <P>Logical OR</P>
                </tr>
                <tr>
                    <P>A and B</P>
                    <P>Logical AND</P>
                </tr>
                <tr>
                    <P>not A</P>
                    <P>Logical NOT</P>
                </tr>
                <tr>
                    <P>A + B</P>
                    <P>Addition</P>
                </tr>
                <tr>
                    <P>A - B</P>
                    <P>Subtraction</P>
                </tr>
                <tr>
                    <P>A * B</P>
                    <P>Multiplication</P>
                </tr>
                <tr>
                    <P>A / B</P>
                    <P>Division</P>
                </tr>
                <tr>
                    <P>A % B</P>
                    <P>Modulo division</P>
                </tr>
                <tr>
                    <P>A ^ B</P>
                    <P>Exponentiation</P>
                </tr>
                <tr>
                    <P>A = B</P>
                    <P>Equality</P>
                </tr>
                <tr>
                    <P>A != B</P>
                    <P>Inequality</P>
                </tr>
                <tr>
                    <P>A >= B</P>
                    <P>Greater than or equal</P>
                </tr>
                <tr>
                    <P>A &lt;= B</P>
                    <P>Less than or equal</P>
                </tr>
                <tr>
                    <P>A > B</P>
                    <P>Greater than</P>
                </tr>
                <tr>
                    <P>A &lt; B</P>
                    <P>Less than</P>
                </tr>
                <tr>
                    <P>A is_vector</P>
                    <P>true if A is a vector, else false</P>
                </tr>
                <tr>
                    <P>A dot B</P>
                    <P>Dot product</P>
                </tr>
                <tr>
                    <P>A cross B</P>
                    <P>Cross product</P>
                </tr>
                <tr>
                    <P>A scalar_of B</P>
                    <P>true if A is a nonzero scalar of B, else false</P>
                </tr>
                <tr>
                    <P>A ~ B</P>
                    <P>matrix similarity</P>
                </tr>
                <tr>
                    <P>A ^T</P>
                    <P>matrix transpose</P>
                </tr>
                <tr>
                    <P>A contains B</P>
                    <P>Checks if a vector is in a basis</P>
                </tr>
                <tr>
                    <P>A in_span B</P>
                    <P>Checks if a vector is in the span of a basis</P>
                </tr>
                <tr>
                    <P>A is_normal</P>
                    <P>checks if a vector or basis is normal</P>
                </tr>
                <tr>
                    <P>A is_orthogonal</P>
                    <P>Checks if a basis is orthogonal</P>
                </tr>
                <tr>
                    <P>A exactly_equal B</P>
                    <P>
                        Compares a basis to another basis, returning true iff they are symbolically
                        identical
                    </P>
                </tr>
            </tbody>
        </table>
    </div>
);
