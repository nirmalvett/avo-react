import React, {Component} from 'react';
import Typography from "@material-ui/core/es/Typography/Typography";

export default class QuestionBuilderDocs extends Component {
    constructor(props) {
        super(props);
    }

    render () {
        return (
            <div style={{margin: 20, flex: 1, overflowY: 'auto'}}>
                <Typography variant='title'>Random Generator Functions</Typography>
                <table>
                    <thead>
                        <tr>
                            <td><Typography variant='subheading'>Function</Typography></td>
                            <td><Typography variant='subheading'>Description</Typography></td>
                            <td><Typography variant='subheading'>Arguments</Typography></td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><Typography>boolean()</Typography></td>
                            <td><Typography>Generates a random boolean value.</Typography></td>
                            <td><Typography>N/A</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>number(min, max, zeroes/mod)</Typography></td>
                            <td><Typography>Generates a random number.</Typography></td>
                            <td><Typography>
                                min: The minimum allowable value (inclusive)
                                <br/>
                                max: The maximum allowable value (inclusive)
                                <br/>
                                zeroes/mod: Set this to 0 to generate any random number in the range.
                                Set it to 1 to generate any nonzero number in the range.
                                Set it to 2+ to generate a number in that modulo base.
                            </Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>Matrix(min, max, zeroes/mod=0, rows, cols=1)</Typography></td>
                            <td><Typography>Generates a matrix with random values.</Typography></td>
                            <td><Typography>
                                min: The minimum allowable value (inclusive)
                                <br/>
                                max: The maximum allowable value (inclusive)
                                <br/>
                                zeroes/mod: Set this to 0 to generate any random number in the range.
                                Set it to 1 to generate any nonzero number in the range.
                                Set it to 2+ to generate a number in that modulo base.
                                <br/>
                                rows: The number of rows in the matrix.
                                <br/>
                                cols: The number of columns in the matrix.
                            </Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>code_vector(check_vector)</Typography></td>
                            <td><Typography>Generates a valid code vector</Typography></td>
                            <td><Typography>
                                check_vector: The check vector for the generated code vector
                            </Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>matrix_rank(dimension, rank, seed=-1, row=-1, column=-1, negative=-1, transpose=-1)</Typography></td>
                            <td><Typography>
                                This generates a matrix with a specified dimension and rank. It starts with a matrix
                                chosen from a list, and then applies transformations to it.
                            </Typography></td>
                            <td><Typography>
                                dimension: The side length of the matrix.
                                <br/>
                                rank: The rank of the matrix.
                                <br/>
                                seed: determines what matrix to start with. Leave it as -1 if unsure.
                                <br/>
                                row: decides the order of the rows. Leave it as -1 if unsure.
                                <br/>
                                column: decides the order of the columns. Leave it as -1 if unsure.
                                <br/>
                                negative: decides which rows and columns to multiply by -1. Leave it as -1 if unsure.
                                <br/>
                                transpose: decides whether to transpose the matrix. Leave it as -1 if unsure.
                            </Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>matrix_eigen(dimension, seed=-1, row=-1)</Typography></td>
                            <td><Typography>Generates a matrix with distinct eigenvalues and eigenvectors</Typography></td>
                            <td><Typography>
                                dimension: The number of rows/columns in the matrix.
                                <br/>
                                seed: the random matrix to start with. Leave it as -1 if unsure.
                                <br/>
                                row: the order that the rows and columns are arranged. Leave it as -1 if unsure.
                            </Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>matrix_rank_mod5(dimension, rank, seed=-1, row=-1, column=-1, transpose=-1)</Typography></td>
                            <td><Typography>
                                This generates a matrix in Z5 with a specified dimension and rank. It starts with a
                                matrix chosen from a list, and then applies transformations to it.
                            </Typography></td>
                            <td><Typography>
                                dimension: The side length of the matrix.
                                <br/>
                                rank: The rank of the matrix.
                                <br/>
                                seed: determines what matrix to start with. Leave it as -1 if unsure.
                                <br/>
                                row: decides the order of the rows. Leave it as -1 if unsure.
                                <br/>
                                column: decides the order of the columns. Leave it as -1 if unsure.
                                <br/>
                                negative: decides which rows and columns to multiply by -1. Leave it as -1 if unsure.
                                <br/>
                                transpose: decides whether to transpose the matrix. Leave it as -1 if unsure.
                            </Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>basis(size, seed=-1, row=-1, column=-1, negative=-1)</Typography></td>
                            <td><Typography>Generates an orthogonal basis.</Typography></td>
                            <td><Typography>
                                size: The size of the basis.
                                <br/>
                                seed: determines what basis to start with. Leave it as -1 if unsure.
                                <br/>
                                row: decides the order of the vectors. Leave it as -1 if unsure.
                                <br/>
                                column: decides the order of the terms in each vector. Leave it as -1 if unsure.
                                <br/>
                                negative: decides which rows and columns to multiply by -1. Leave it as -1 if unsure.
                            </Typography></td>
                        </tr>
                    </tbody>
                </table>
                <Typography variant='title'>Other Functions</Typography>
                <table>
                    <thead>
                        <tr>
                            <td><Typography variant='subheading'>Function</Typography></td>
                            <td><Typography variant='subheading'>Description</Typography></td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><Typography>sqrt(n)</Typography></td>
                            <td><Typography>Calculates the square root of the number</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>sin(n)</Typography></td>
                            <td><Typography>Calculates the sine of the number</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>cos(n)</Typography></td>
                            <td><Typography>Calculates the cosine of the number</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>tan(n)</Typography></td>
                            <td><Typography>Calculates the tangent of the number</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>arcsin(n)</Typography></td>
                            <td><Typography>Calculates the inverse sine of the number</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>arccos(n)</Typography></td>
                            <td><Typography>Calculates the inverse cosine of the number</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>arctan(n)</Typography></td>
                            <td><Typography>Calculates the inverse tangent of the number</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>rot(n)</Typography></td>
                            <td><Typography>Finds the rotation matrix of the given angle</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>ref(n)</Typography></td>
                            <td><Typography>Finds the reflection matrix of the given angle</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>norm(v)</Typography></td>
                            <td><Typography>The length of the given vector</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>angle(u,v)</Typography></td>
                            <td><Typography>The angle between the two vectors</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>proj(u,v)</Typography></td>
                            <td><Typography>The projection of v onto u</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>get(m, row=0, col=0)</Typography></td>
                            <td><Typography>Gets the cell at the specified location of the matrix</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>set(m, row=0, col=0, n)</Typography></td>
                            <td><Typography>Sets the cell at the specified location of the matrix with the specified value</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>adj(m)</Typography></td>
                            <td><Typography>Finds the adjoint of the matrix</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>det(m)</Typography></td>
                            <td><Typography>Calculates the determinant of the matrix</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>inverse(m)</Typography></td>
                            <td><Typography>Calculates the inverse of the matrix</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>rref(m)</Typography></td>
                            <td><Typography>Finds the reduced row echelon form of the matrix</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>row(m)</Typography></td>
                            <td><Typography>Finds the row space of the matrix</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>col(m)</Typography></td>
                            <td><Typography>Finds the column space of the matrix</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>null(m)</Typography></td>
                            <td><Typography>Finds the null space of the matrix</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>eigenspaces(m)</Typography></td>
                            <td><Typography>Finds the eigenvectors and eigenvalues of the matrix</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>diagonal(v)</Typography></td>
                            <td><Typography>Creates a matrix with the vector as the diagonal values</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>rank(m)</Typography></td>
                            <td><Typography>Finds the rank of the matrix</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>char_poly(m)</Typography></td>
                            <td><Typography>Computes the characteristic polynomial of the matrix</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>orthogonalize(b)</Typography></td>
                            <td><Typography>Uses the Gram-Schmidt process to orthogonalize the basis</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>pmatrix(b)</Typography></td>
                            <td><Typography>Finds the projection matrix for the basis</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>normalize(b)</Typography></td>
                            <td><Typography>Normalizes the basis</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>dim(b)</Typography></td>
                            <td><Typography>Finds the dimension of the basis</Typography></td>
                        </tr>
                    </tbody>
                </table>
                <Typography variant='title'>Marking Functions</Typography>
                <table>
                    <thead>
                        <tr>
                            <td><Typography variant='subheading'>Function</Typography></td>
                            <td><Typography variant='subheading'>Usage</Typography></td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><Typography>tf(student_answer, correct_answer)</Typography></td>
                            <td><Typography>
                                This function is used for marking true/false questions. For example, if you wanted
                                to give them marks for selecting "False" on part 4, you would set the criteria as
                                "tf(@4, False)".
                            </Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>mc(student_answer, correct_answer)</Typography></td>
                            <td><Typography>
                                This function is used for marking multiple choice questions. For example, if you
                                wanted to give them marks for selecting the second answer on part 3, you would set
                                the criteria as "mc(@3, 2)".
                            </Typography></td>
                        </tr>
                    </tbody>
                </table>
                <Typography variant='title'>Display Functions</Typography>
                <table>
                    <thead>
                        <tr>
                            <td><Typography variant='subheading'>Function</Typography></td>
                            <td><Typography variant='subheading'>Description</Typography></td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><Typography>equations(m, v)</Typography></td>
                            <td><Typography>
                                This turns the matrix and vector into a system of equations. If every equation
                                equals zero, you can just put '0' instead of a vector.
                            </Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>pivots(m)</Typography></td>
                            <td><Typography>This highlights the pivots in a matrix.</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>free_vars(v, b)</Typography></td>
                            <td><Typography>
                                This creates a vector with free variables. Each free variable is a vector in the basis.
                            </Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>point(v)</Typography></td>
                            <td><Typography>
                                This displays the vector as a coordinate rather than vertically in square brackets.
                                It is mostly useful for 1229 questions, or questions related to lines and planes.
                            </Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>augment(m, v)</Typography></td>
                            <td><Typography>This creates the augmented matrix [m|v].</Typography></td>
                        </tr>
                    </tbody>
                </table>
                <Typography variant='title'>Operators</Typography>
                <table>
                    <thead>
                        <tr>
                            <td><Typography variant='subheading'>Operator</Typography></td>
                            <td><Typography variant='subheading'>Description</Typography></td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><Typography>A or B</Typography></td>
                            <td><Typography>Logical OR</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A and B</Typography></td>
                            <td><Typography>Logical AND</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>not A</Typography></td>
                            <td><Typography>Logical NOT</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A + B</Typography></td>
                            <td><Typography>Addition</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A - B</Typography></td>
                            <td><Typography>Subtraction</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A * B</Typography></td>
                            <td><Typography>Multiplication</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A / B</Typography></td>
                            <td><Typography>Division</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A % B</Typography></td>
                            <td><Typography>Modulo division</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A ^ B</Typography></td>
                            <td><Typography>Exponentiation</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A = B</Typography></td>
                            <td><Typography>Equality</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A != B</Typography></td>
                            <td><Typography>Inequality</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A >= B</Typography></td>
                            <td><Typography>Greater than or equal</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A &lt;= B</Typography></td>
                            <td><Typography>Less than or equal</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A > B</Typography></td>
                            <td><Typography>Greater than</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A &lt; B</Typography></td>
                            <td><Typography>Less than</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A is_vector</Typography></td>
                            <td><Typography>true if A is a vector, else false</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A dot B</Typography></td>
                            <td><Typography>Dot product</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A cross B</Typography></td>
                            <td><Typography>Cross product</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A scalar_of B</Typography></td>
                            <td><Typography>true if A is a nonzero scalar of B, else false</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A ~ B</Typography></td>
                            <td><Typography>matrix similarity</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A ^T</Typography></td>
                            <td><Typography>matrix transpose</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A contains B</Typography></td>
                            <td><Typography>Checks if a vector is in a basis</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A in_span B</Typography></td>
                            <td><Typography>Checks if a vector is in the span of a basis</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A is_normal</Typography></td>
                            <td><Typography>checks if a vector or basis is normal</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A is_orthogonal</Typography></td>
                            <td><Typography>Checks if a basis is orthogonal</Typography></td>
                        </tr>
                        <tr>
                            <td><Typography>A exactly_equal B</Typography></td>
                            <td><Typography>
                                Compares a basis to another basis, returning true iff they are symbolically identical
                            </Typography></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}
