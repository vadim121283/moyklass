module.exports = (sequelize, DataTypes) => {
    const Student = sequelize.define('Student', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 10]
            }
        }
    },{
        sequelize,
        underscored: true,
        tableName: 'students',
    });

    Student.associate = function(models) {
        models.Student.belongsToMany(models.Lesson, {through: 'LessonStudents'});
    };

    return Student;
};
