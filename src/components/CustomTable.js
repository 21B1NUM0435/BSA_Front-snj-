import React, { useState } from "react";
import { Table, Input, Button } from "antd";
import { RedoOutlined } from "@ant-design/icons";

// CustomTable компонентыг эхлүүлж байна. Энэ нь хүснэгтийн өгөгдлийг харуулах болон хайлт хийх боломжийг олгоно.
const CustomTable = ({
  columns, // Хүснэгтийн баганы мэдээлэл
  dataSource, // Хүснэгтэнд харуулах өгөгдлийн эх үүсвэр
  bordered, // Хүснэгтийн хүрээг харагдуулах эсэх
  scroll, // Хүснэгт гүйлгэх тохиргоо
  hasLookupField, // Хайх талбарыг харуулах эсэх
  onRefresh, // Шинэчлэх товчлуурын үйлдэл
}) => {
  const [searchText, setSearchText] = useState(""); // Хайлт хийх текстийг хадгалах төлөв

  // Хайлтын утгыг боловсруулах функц
  const handleSearch = (value) => {
    setSearchText(value); // Хайлт хийх текстийг төлөвт хадгална
  };

  // Өгөгдлийг хайлтын текстээр шүүж, зөвхөн тохирох өгөгдлийг харуулна
  const filteredDataSource = dataSource.filter((record) =>
    Object.values(record).some((value) =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <div>
      {/* Хэрэв хайлтын талбар харагдах бол доорх хэсгийг харуулна */}
      {hasLookupField && (
        <div
          style={{
            marginBottom: "16px", // Доорх хүснэгтээс зайтай харагдана
            display: "flex",
            justifyContent: "space-between", // Хайлт болон шинэчлэх товчийг хоёр талд байрлуулна
            alignItems: "center", // Хэвтээ төвийн дагуу зэрэгцүүлнэ
          }}
        >
          {/* Хайх талбар */}
          <Input
            placeholder="Search..." // Хайх талбарт харуулах анхны текст
            allowClear // Хайлт хийх текстийг арилгах товч
            value={searchText} // Текстийн төлөв
            onChange={(e) => handleSearch(e.target.value)} // Текст өөрчлөгдөх бүр хайлтыг шинэчилнэ
            style={{
              width: 400, // Хайлт хийх талбарын өргөн
            }}
          />
          {/* Шинэчлэх товчлуур */}
          <Button
            type="default" // Товчлуурын хэв маяг
            onClick={onRefresh} // Шинэчлэх үйлдлийг дуудах
            icon={<RedoOutlined />} // Товчлуурын дүрс
          />
        </div>
      )}
      {/* Хүснэгтийг харуулах хэсэг */}
      <Table
        columns={columns} // Хүснэгтийн баганууд
        dataSource={filteredDataSource} // Шүүсэн өгөгдөл
        bordered={bordered} // Хүрээтэй эсэх
        scroll={scroll} // Гүйлгэх тохиргоо
        pagination={{
          pageSize: 8, // Хуудас бүрт харуулах мөрийн тоо
        }}
      />
    </div>
  );
};

export default CustomTable; // CustomTable компонентыг бусад файлд ашиглах боломжтой болгоно
