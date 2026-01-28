import React from "react";
import { useNavigate } from "react-router-dom";
import type { DataSource } from "./types";
import { FaArrowDown, FaArrowUp, FaRegCopy } from "react-icons/fa";
import { maskApiKey } from "../../common/mask-api-key";
import DropdownMenu from "../common/DropdownItem";
import { SubPage } from "./SubPages";

const handleCopy = (text: string) => {
  navigator.clipboard.writeText(text);
};

interface Props {
  data: DataSource[];
  onAdd: () => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onSubPageSelected?: (id: number, subPage: SubPage) => void;
  onMoveUp?: (dataSourceId: number) => void;
  onMoveDown?: (dataSourceId: number) => void;
}

const DataSourcesTable: React.FC<Props> = ({ data, onAdd, onEdit, onDelete, onSubPageSelected, onMoveUp, onMoveDown }) => {
  const navigate = useNavigate();

  const handleNameClick = (dataSourceId: number) => {
    navigate(`/data-sources/${dataSourceId}`);
  };

  const handleMoveUp = (dataSourceId: number) => {
    onMoveUp && onMoveUp(dataSourceId);
  };

  const handleMoveDown = (dataSourceId: number) => {
    onMoveDown && onMoveDown(dataSourceId);
  };

  return (
    <div className="overflow-x-auto overflow-y-hidden container">
      <table className="w-full border-collapse text-[14px]">
        <thead>
          <tr className="bg-[#f7f9fb] font-semibold text-[#333]">
            <th className="px-[18px] py-[18px] text-left border-b border-[#e4e4e7]">Name</th>
            <th className="px-[18px] py-[18px] text-left border-b border-[#e4e4e7]">Status</th>
            <th className="px-[18px] py-[18px] text-left border-b border-[#e4e4e7]">Message</th>
            <th className="px-[18px] py-[18px] text-left border-b border-[#e4e4e7]">API Key</th>
            <th className="px-[18px] py-[18px] text-left border-b border-[#e4e4e7]">Engine Key</th>
            <th className="px-[18px] py-[18px] text-left border-b border-[#e4e4e7]">Last Updated</th>
            <th className="px-[18px] py-[18px] text-left border-b border-[#e4e4e7]">Entities</th>
            <th className="px-[18px] py-[18px] text-left border-b border-[#e4e4e7]">Data</th>
            <th className="px-[18px] py-[18px] text-left border-b border-[#e4e4e7]"></th>
            <th className="px-[18px] py-[18px] text-left border-b border-[#e4e4e7]"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((source, index) => (
            <tr key={source.id} className="border-t border-[#e4e4e7] align-top last:border-b last:h-[80px]">
              <td className="px-[12px] py-[12px] w-[220px]">
                <strong 
                  className="text-[#3758f9] cursor-pointer hover:underline"
                  onClick={() => handleNameClick(source.id)}
                >
                  {source.name}
                </strong>
                <div className="text-[#6c757d] text-[12px]">{source.url}</div>
              </td>
              <td className="px-[12px] py-[12px]">
                <span
                  className={`px-[12px] py-[5px] text-[12px] rounded-full font-medium inline-block ${source.status.toLowerCase() === 'active'
                    ? 'bg-[#e7f3ed] text-[#198754]'
                    : source.status.toLowerCase() === 'disabled'
                      ? 'bg-[#e2e3e5] text-[#6c757d]'
                      : 'bg-[#f8d7da] text-[#dc3545]'
                    }`}
                >
                  {source.status}
                </span>
              </td>
              <td className="px-[12px] py-[12px]">{source.message}</td>
              <td className="px-[12px] py-[12px]">
                <div className="flex items-center whitespace-nowrap">
                  {maskApiKey(source.apiKey)}
                  <FaRegCopy
                    className="ml-[6px] text-[#888] cursor-pointer hover:text-black"
                    onClick={() => handleCopy(source.apiKey)}
                  />
                </div>
              </td>
              <td className="px-[12px] py-[12px]">
                <div className="flex items-center whitespace-nowrap">
                  {maskApiKey(source.engineApiKey)}
                  <FaRegCopy
                    className="ml-[6px] text-[#888] cursor-pointer hover:text-black"
                    onClick={() => handleCopy(source.engineApiKey)}
                  />
                </div>
              </td>
              <td className="px-[12px] py-[12px]">{source.updatedAt}</td>
              <td className="px-[12px] py-[12px]">
                <span className="text-[#3758f9] cursor-pointer hover:underline"
                  onClick={() => onSubPageSelected && onSubPageSelected(source.id, SubPage.ENTITIES)}>
                  Entities
                </span>
              </td>
              <td className="px-[12px] py-[12px]">
                <span className="text-[#3758f9] cursor-pointer hover:underline"
                  onClick={() => onSubPageSelected && onSubPageSelected(source.id, SubPage.DATA_PAGE)}>
                  Data
                </span>
              </td>
              <td className="px-[12px] py-[12px]">
                <div className="flex items-center justify-center gap-1">
                  { index > 0 && (
                  <span title="Move up">
                    <FaArrowUp className="cursor-pointer hover:text-black" onClick={() => handleMoveUp(source.id)}/>
                  </span>
                  )}
                  {index < data.length - 1 && (
                    <span title="Move down">
                      <FaArrowDown className="cursor-pointer hover:text-black" onClick={() => handleMoveDown(source.id)}/>
                    </span>
                  )}
                </div>
              </td>
              <td className="px-[12px] py-[12px] relative w-[80px]">
                <DropdownMenu
                  items={[
                    { label: "Edit", onClick: () => onEdit && onEdit(source.id) },
                    { label: "Delete", onClick: () => onDelete && onDelete(source.id), danger: true },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right mt-[20px]">
        <button
          className="text-[13px] cursor-pointer rounded-full bg-white border border-[#3758f9] px-[20px] py-[5px] text-[#3758f9] mr-[22px] hover:bg-[#3758f9] hover:text-white transition"
          onClick={onAdd}
        >
          Add
        </button>
      </div>
    </div >
  );
};

export default DataSourcesTable;
