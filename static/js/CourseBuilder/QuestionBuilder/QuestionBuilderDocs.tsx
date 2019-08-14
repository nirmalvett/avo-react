import React, {ReactElement} from 'react';
import Typography from '@material-ui/core/Typography/Typography';

const s = {verticalAlign: 'top', padding: 16};

export default (): ReactElement => (
    <div style={{margin: 20, flex: 1, overflowY: 'auto'}}>
        <Typography color='textPrimary' variant='h6'>Random Generator Functions</Typography>
        <table>
            <thead>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary' variant='subtitle1'>Function</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary' variant='subtitle1'>Description</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary' variant='subtitle1'>Arguments</Typography>
                    </td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>boolean()</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Generates a random boolean value.</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>N/A</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>number(min, max, zeroes/mod)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Generates a random number.</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            min: The minimum allowable value (inclusive)
                            <br />
                            max: The maximum allowable value (inclusive)
                            <br />
                            zeroes/mod: Set this to 0 to generate any random number in the range.
                            Set it to 1 to generate any nonzero number in the range. Set it to 2+ to
                            generate a number in that modulo base.
                        </Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>Matrix(min, max, zeroes/mod=0, rows, cols=1)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Generates a matrix with random values.</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            min: The minimum allowable value (inclusive)
                            <br />
                            max: The maximum allowable value (inclusive)
                            <br />
                            zeroes/mod: Set this to 0 to generate any random number in the range.
                            Set it to 1 to generate any nonzero number in the range. Set it to 2+ to
                            generate a number in that modulo base.
                            <br />
                            rows: The number of rows in the matrix.
                            <br />
                            cols: The number of columns in the matrix.
                        </Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>code_vector(check_vector)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Generates a valid code vector</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            check_vector: The check vector for the generated code vector
                        </Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            matrix_rank(dimension, rank, seed=-1, row=-1, column=-1, negative=-1,
                            transpose=-1)
                        </Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            This generates a matrix with a specified dimension and rank. It starts
                            with a matrix chosen from a list, and then applies transformations to
                            it.
                        </Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
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
                            negative: decides which rows and columns to multiply by -1. Leave it as
                            -1 if unsure.
                            <br />
                            transpose: decides whether to transpose the matrix. Leave it as -1 if
                            unsure.
                        </Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>matrix_eigen(dimension, seed=-1, row=-1)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            Generates a matrix with distinct eigenvalues and eigenvectors
                        </Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            dimension: The number of rows/columns in the matrix.
                            <br />
                            seed: the random matrix to start with. Leave it as -1 if unsure.
                            <br />
                            row: the order that the rows and columns are arranged. Leave it as -1 if
                            unsure.
                        </Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            matrix_rank_mod5(dimension, rank, seed=-1, row=-1, column=-1,
                            transpose=-1)
                        </Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            This generates a matrix in Z5 with a specified dimension and rank. It
                            starts with a matrix chosen from a list, and then applies
                            transformations to it.
                        </Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
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
                            negative: decides which rows and columns to multiply by -1. Leave it as
                            -1 if unsure.
                            <br />
                            transpose: decides whether to transpose the matrix. Leave it as -1 if
                            unsure.
                        </Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            basis(size, seed=-1, row=-1, column=-1, negative=-1)
                        </Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Generates an orthogonal basis.</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            size: The size of the basis.
                            <br />
                            seed: determines what basis to start with. Leave it as -1 if unsure.
                            <br />
                            row: decides the order of the vectors. Leave it as -1 if unsure.
                            <br />
                            column: decides the order of the terms in each vector. Leave it as -1 if
                            unsure.
                            <br />
                            negative: decides which rows and columns to multiply by -1. Leave it as
                            -1 if unsure.
                        </Typography>
                    </td>
                </tr>
            </tbody>
        </table>
        <Typography color='textPrimary' variant='h6'>Other Functions</Typography>
        <table>
            <thead>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary' variant='subtitle1'>Function</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary' variant='subtitle1'>Description</Typography>
                    </td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>sqrt(n)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Calculates the square root of the number</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>sin(n)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Calculates the sine of the number</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>cos(n)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Calculates the cosine of the number</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>tan(n)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Calculates the tangent of the number</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>arcsin(n)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Calculates the inverse sine of the number</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>arccos(n)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Calculates the inverse cosine of the number</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>arctan(n)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Calculates the inverse tangent of the number</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>rot(n)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Finds the rotation matrix of the given angle</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>ref(n)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Finds the reflection matrix of the given angle</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>norm(v)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>The length of the given vector</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>angle(u,v)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>The angle between the two vectors</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>proj(u,v)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>The projection of v onto u</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>get(m, row=0, col=0)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            Gets the cell at the specified location of the matrix
                        </Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>set(m, row=0, col=0, n)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            Sets the cell at the specified location of the matrix with the specified
                            value
                        </Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>adj(m)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Finds the adjoint of the matrix</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>det(m)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Calculates the determinant of the matrix</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>inverse(m)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Calculates the inverse of the matrix</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>rref(m)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Finds the reduced row echelon form of the matrix</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>row(m)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Finds the row space of the matrix</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>col(m)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Finds the column space of the matrix</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>null(m)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Finds the null space of the matrix</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>eigenspaces(m)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            Finds the eigenvectors and eigenvalues of the matrix
                        </Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>diagonal(v)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            Creates a matrix with the vector as the diagonal values
                        </Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>rank(m)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Finds the rank of the matrix</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>char_poly(m)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            Computes the characteristic polynomial of the matrix
                        </Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>orthogonalize(b)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            Uses the Gram-Schmidt process to orthogonalize the basis
                        </Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>pmatrix(b)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Finds the projection matrix for the basis</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>normalize(b)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Normalizes the basis</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>dim(b)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Finds the dimension of the basis</Typography>
                    </td>
                </tr>
            </tbody>
        </table>
        <Typography color='textPrimary' variant='h6'>Marking Functions</Typography>
        <table>
            <thead>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary' variant='subtitle1'>Function</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary' variant='subtitle1'>Usage</Typography>
                    </td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>tf(student_answer, correct_answer)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            This function is used for marking true/false questions. For example, if
                            you wanted to give them marks for selecting "False" on part 4, you would
                            set the criteria as "tf(@4, False)".
                        </Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>mc(student_answer, correct_answer)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            This function is used for marking multiple choice questions. For
                            example, if you wanted to give them marks for selecting the second
                            answer on part 3, you would set the criteria as "mc(@3, 2)".
                        </Typography>
                    </td>
                </tr>
            </tbody>
        </table>
        <Typography color='textPrimary' variant='h6'>Display Functions</Typography>
        <table>
            <thead>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary' variant='subtitle1'>Function</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary' variant='subtitle1'>Description</Typography>
                    </td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>equations(m, v)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            This turns the matrix and vector into a system of equations. If every
                            equation equals zero, you can just put '0' instead of a vector.
                        </Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>pivots(m)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>This highlights the pivots in a matrix.</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>free_vars(v, b)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            This creates a vector with free variables. Each free variable is a
                            vector in the basis.
                        </Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>point(v)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            This displays the vector as a coordinate rather than vertically in
                            square brackets. It is mostly useful for 1229 questions, or questions
                            related to lines and planes.
                        </Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>augment(m, v)</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>This creates the augmented matrix [m|v].</Typography>
                    </td>
                </tr>
            </tbody>
        </table>
        <Typography color='textPrimary' variant='h6'>Operators</Typography>
        <table>
            <thead>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary' variant='subtitle1'>Operator</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary' variant='subtitle1'>Description</Typography>
                    </td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A or B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Logical OR</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A and B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Logical AND</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>not A</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Logical NOT</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A + B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Addition</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A - B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Subtraction</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A * B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Multiplication</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A / B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Division</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A % B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Modulo division</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A ^ B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Exponentiation</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A = B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Equality</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A != B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Inequality</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A >= B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Greater than or equal</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A &lt;= B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Less than or equal</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A > B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Greater than</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A &lt; B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Less than</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A is_vector</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>true if A is a vector, else false</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A dot B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Dot product</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A cross B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Cross product</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A scalar_of B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>true if A is a nonzero scalar of B, else false</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A ~ B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>matrix similarity</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A ^T</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>matrix transpose</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A contains B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Checks if a vector is in a basis</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A in_span B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Checks if a vector is in the span of a basis</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A is_normal</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>checks if a vector or basis is normal</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A is_orthogonal</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>Checks if a basis is orthogonal</Typography>
                    </td>
                </tr>
                <tr>
                    <td style={s}>
                        <Typography color='textPrimary'>A exactly_equal B</Typography>
                    </td>
                    <td style={s}>
                        <Typography color='textPrimary'>
                            Compares a basis to another basis, returning true iff they are
                            symbolically identical
                        </Typography>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
);
