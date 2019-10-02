module.exports = (sequelize, DataTypes) => {
    const LessonStudents = sequelize.define('LessonStudents', {
        visit: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    },{
        sequelize,
        underscored: true,
        tableName: 'lesson_students',
    });

    return LessonStudents;
};
